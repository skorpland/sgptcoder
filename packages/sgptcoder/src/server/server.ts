import { Log } from "../util/log"
import { Bus } from "../bus"
import { describeRoute, generateSpecs, validator, resolver, openAPIRouteHandler } from "hono-openapi"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { streamSSE } from "hono/streaming"
import { Session } from "../session"
import z from "zod/v4"
import { Provider } from "../provider/provider"
import { mapValues } from "remeda"
import { NamedError } from "../util/error"
import { ModelsDev } from "../provider/models"
import { Ripgrep } from "../file/ripgrep"
import { Config } from "../config/config"
import { File } from "../file"
import { LSP } from "../lsp"
import { MessageV2 } from "../session/message-v2"
import { callTui, TuiRoute } from "./tui"
import { Permission } from "../permission"
import { Instance } from "../project/instance"
import { Agent } from "../agent/agent"
import { Auth } from "../auth"
import { Command } from "../command"
import { Global } from "../global"
import { ProjectRoute } from "./project"
import { ToolRegistry } from "../tool/registry"
import { zodToJsonSchema } from "zod-to-json-schema"
import { SessionPrompt } from "../session/prompt"
import { SessionCompaction } from "../session/compaction"
import { SessionRevert } from "../session/revert"
import { lazy } from "../util/lazy"

const ERRORS = {
  400: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: resolver(
          z
            .object({
              data: z.record(z.string(), z.any()),
            })
            .meta({
              ref: "Error",
            }),
        ),
      },
    },
  },
} as const

export namespace Server {
  const log = Log.create({ service: "server" })

  // Schemas for HTTP tool registration
  const HttpParamSpec = z
    .object({
      type: z.enum(["string", "number", "boolean", "array"]),
      description: z.string().optional(),
      optional: z.boolean().optional(),
      items: z.enum(["string", "number", "boolean"]).optional(),
    })
    .meta({ ref: "HttpParamSpec" })

  const HttpToolRegistration = z
    .object({
      id: z.string(),
      description: z.string(),
      parameters: z.object({
        type: z.literal("object"),
        properties: z.record(z.string(), HttpParamSpec),
      }),
      callbackUrl: z.string(),
      headers: z.record(z.string(), z.string()).optional(),
    })
    .meta({ ref: "HttpToolRegistration" })

  export const Event = {
    Connected: Bus.event("server.connected", z.object({})),
  }

  const app = new Hono()
  export const App = lazy(() =>
    app
      .onError((err, c) => {
        log.error("failed", {
          error: err,
        })
        if (err instanceof NamedError) {
          return c.json(err.toObject(), {
            status: 400,
          })
        }
        return c.json(new NamedError.Unknown({ message: err.toString() }).toObject(), {
          status: 400,
        })
      })
      .use(async (c, next) => {
        const skipLogging = c.req.path === "/log"
        if (!skipLogging) {
          log.info("request", {
            method: c.req.method,
            path: c.req.path,
          })
        }
        const start = Date.now()
        await next()
        if (!skipLogging) {
          log.info("response", {
            duration: Date.now() - start,
          })
        }
      })
      .use(async (c, next) => {
        const directory = c.req.query("directory") ?? process.cwd()
        return Instance.provide(directory, async () => {
          return next()
        })
      })
      .use(cors())
      .get(
        "/doc",
        openAPIRouteHandler(app, {
          documentation: {
            info: {
              title: "sgptcoder",
              version: "0.0.3",
              description: "sgptcoder api",
            },
            openapi: "3.1.1",
          },
        }),
      )
      .use(validator("query", z.object({ directory: z.string().optional() })))
      .route("/project", ProjectRoute)
      .get(
        "/config",
        describeRoute({
          description: "Get config info",
          operationId: "config.get",
          responses: {
            200: {
              description: "Get config info",
              content: {
                "application/json": {
                  schema: resolver(Config.Info),
                },
              },
            },
          },
        }),
        async (c) => {
          return c.json(await Config.get())
        },
      )
      .post(
        "/experimental/tool/register",
        describeRoute({
          description: "Register a new HTTP callback tool",
          operationId: "tool.register",
          responses: {
            200: {
              description: "Tool registered successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
            ...ERRORS,
          },
        }),
        validator("json", HttpToolRegistration),
        async (c) => {
          ToolRegistry.registerHTTP(c.req.valid("json"))
          return c.json(true)
        },
      )
      .get(
        "/experimental/tool/ids",
        describeRoute({
          description: "List all tool IDs (including built-in and dynamically registered)",
          operationId: "tool.ids",
          responses: {
            200: {
              description: "Tool IDs",
              content: {
                "application/json": {
                  schema: resolver(z.array(z.string()).meta({ ref: "ToolIDs" })),
                },
              },
            },
            ...ERRORS,
          },
        }),
        async (c) => {
          return c.json(ToolRegistry.ids())
        },
      )
      .get(
        "/experimental/tool",
        describeRoute({
          description: "List tools with JSON schema parameters for a provider/model",
          operationId: "tool.list",
          responses: {
            200: {
              description: "Tools",
              content: {
                "application/json": {
                  schema: resolver(
                    z
                      .array(
                        z
                          .object({
                            id: z.string(),
                            description: z.string(),
                            parameters: z.any(),
                          })
                          .meta({ ref: "ToolListItem" }),
                      )
                      .meta({ ref: "ToolList" }),
                  ),
                },
              },
            },
            ...ERRORS,
          },
        }),
        validator(
          "query",
          z.object({
            provider: z.string(),
            model: z.string(),
          }),
        ),
        async (c) => {
          const { provider, model } = c.req.valid("query")
          const tools = await ToolRegistry.tools(provider, model)
          return c.json(
            tools.map((t) => ({
              id: t.id,
              description: t.description,
              // Handle both Zod schemas and plain JSON schemas
              parameters: (t.parameters as any)?._def ? zodToJsonSchema(t.parameters as any) : t.parameters,
            })),
          )
        },
      )
      .get(
        "/path",
        describeRoute({
          description: "Get the current path",
          operationId: "path.get",
          responses: {
            200: {
              description: "Path",
              content: {
                "application/json": {
                  schema: resolver(
                    z
                      .object({
                        state: z.string(),
                        config: z.string(),
                        worktree: z.string(),
                        directory: z.string(),
                      })
                      .meta({
                        ref: "Path",
                      }),
                  ),
                },
              },
            },
          },
        }),
        async (c) => {
          return c.json({
            state: Global.Path.state,
            config: Global.Path.config,
            worktree: Instance.worktree,
            directory: Instance.directory,
          })
        },
      )
      .get(
        "/session",
        describeRoute({
          description: "List all sessions",
          operationId: "session.list",
          responses: {
            200: {
              description: "List of sessions",
              content: {
                "application/json": {
                  schema: resolver(Session.Info.array()),
                },
              },
            },
          },
        }),
        async (c) => {
          const sessions = await Array.fromAsync(Session.list())
          sessions.sort((a, b) => b.time.updated - a.time.updated)
          return c.json(sessions)
        },
      )
      .get(
        "/session/:id",
        describeRoute({
          description: "Get session",
          operationId: "session.get",
          responses: {
            200: {
              description: "Get session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const session = await Session.get(sessionID)
          return c.json(session)
        },
      )
      .get(
        "/session/:id/children",
        describeRoute({
          description: "Get a session's children",
          operationId: "session.children",
          responses: {
            200: {
              description: "List of children",
              content: {
                "application/json": {
                  schema: resolver(Session.Info.array()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const session = await Session.children(sessionID)
          return c.json(session)
        },
      )
      .post(
        "/session",
        describeRoute({
          description: "Create a new session",
          operationId: "session.create",
          responses: {
            ...ERRORS,
            200: {
              description: "Successfully created session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "json",
          z
            .object({
              parentID: z.string().optional(),
              title: z.string().optional(),
            })
            .optional(),
        ),
        async (c) => {
          const body = c.req.valid("json") ?? {}
          const session = await Session.create(body.parentID, body.title)
          return c.json(session)
        },
      )
      .delete(
        "/session/:id",
        describeRoute({
          description: "Delete a session and all its data",
          operationId: "session.delete",
          responses: {
            200: {
              description: "Successfully deleted session",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          await Session.remove(c.req.valid("param").id)
          return c.json(true)
        },
      )
      .patch(
        "/session/:id",
        describeRoute({
          description: "Update session properties",
          operationId: "session.update",
          responses: {
            200: {
              description: "Successfully updated session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        validator(
          "json",
          z.object({
            title: z.string().optional(),
          }),
        ),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const updates = c.req.valid("json")

          const updatedSession = await Session.update(sessionID, (session) => {
            if (updates.title !== undefined) {
              session.title = updates.title
            }
          })

          return c.json(updatedSession)
        },
      )
      .post(
        "/session/:id/init",
        describeRoute({
          description: "Analyze the app and create an AGENTS.md file",
          operationId: "session.init",
          responses: {
            200: {
              description: "200",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        validator(
          "json",
          z.object({
            messageID: z.string(),
            providerID: z.string(),
            modelID: z.string(),
          }),
        ),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const body = c.req.valid("json")
          await Session.initialize({ ...body, sessionID })
          return c.json(true)
        },
      )
      .post(
        "/session/:id/abort",
        describeRoute({
          description: "Abort a session",
          operationId: "session.abort",
          responses: {
            200: {
              description: "Aborted session",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          return c.json(SessionPrompt.abort(c.req.valid("param").id))
        },
      )
      .post(
        "/session/:id/share",
        describeRoute({
          description: "Share a session",
          operationId: "session.share",
          responses: {
            200: {
              description: "Successfully shared session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          const id = c.req.valid("param").id
          await Session.share(id)
          const session = await Session.get(id)
          return c.json(session)
        },
      )
      .delete(
        "/session/:id/share",
        describeRoute({
          description: "Unshare the session",
          operationId: "session.unshare",
          responses: {
            200: {
              description: "Successfully unshared session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          const id = c.req.valid("param").id
          await Session.unshare(id)
          const session = await Session.get(id)
          return c.json(session)
        },
      )
      .post(
        "/session/:id/summarize",
        describeRoute({
          description: "Summarize the session",
          operationId: "session.summarize",
          responses: {
            200: {
              description: "Summarized session",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        validator(
          "json",
          z.object({
            providerID: z.string(),
            modelID: z.string(),
          }),
        ),
        async (c) => {
          const id = c.req.valid("param").id
          const body = c.req.valid("json")
          await SessionCompaction.run({ ...body, sessionID: id })
          return c.json(true)
        },
      )
      .get(
        "/session/:id/message",
        describeRoute({
          description: "List messages for a session",
          operationId: "session.messages",
          responses: {
            200: {
              description: "List of messages",
              content: {
                "application/json": {
                  schema: resolver(MessageV2.WithParts.array()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        async (c) => {
          const messages = await Session.messages(c.req.valid("param").id)
          return c.json(messages)
        },
      )
      .get(
        "/session/:id/message/:messageID",
        describeRoute({
          description: "Get a message from a session",
          operationId: "session.message",
          responses: {
            200: {
              description: "Message",
              content: {
                "application/json": {
                  schema: resolver(
                    z.object({
                      info: MessageV2.Info,
                      parts: MessageV2.Part.array(),
                    }),
                  ),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
            messageID: z.string().meta({ description: "Message ID" }),
          }),
        ),
        async (c) => {
          const params = c.req.valid("param")
          const message = await Session.getMessage(params.id, params.messageID)
          return c.json(message)
        },
      )
      .post(
        "/session/:id/message",
        describeRoute({
          description: "Create and send a new message to a session",
          operationId: "session.prompt",
          responses: {
            200: {
              description: "Created message",
              content: {
                "application/json": {
                  schema: resolver(
                    z.object({
                      info: MessageV2.Assistant,
                      parts: MessageV2.Part.array(),
                    }),
                  ),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        validator("json", SessionPrompt.PromptInput.omit({ sessionID: true })),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const body = c.req.valid("json")
          const msg = await SessionPrompt.prompt({ ...body, sessionID })
          return c.json(msg)
        },
      )
      .post(
        "/session/:id/command",
        describeRoute({
          description: "Send a new command to a session",
          operationId: "session.command",
          responses: {
            200: {
              description: "Created message",
              content: {
                "application/json": {
                  schema: resolver(
                    z.object({
                      info: MessageV2.Assistant,
                      parts: MessageV2.Part.array(),
                    }),
                  ),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        validator("json", SessionPrompt.CommandInput.omit({ sessionID: true })),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const body = c.req.valid("json")
          const msg = await SessionPrompt.command({ ...body, sessionID })
          return c.json(msg)
        },
      )
      .post(
        "/session/:id/shell",
        describeRoute({
          description: "Run a shell command",
          operationId: "session.shell",
          responses: {
            200: {
              description: "Created message",
              content: {
                "application/json": {
                  schema: resolver(MessageV2.Assistant),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string().meta({ description: "Session ID" }),
          }),
        ),
        validator("json", SessionPrompt.ShellInput.omit({ sessionID: true })),
        async (c) => {
          const sessionID = c.req.valid("param").id
          const body = c.req.valid("json")
          const msg = await SessionPrompt.shell({ ...body, sessionID })
          return c.json(msg)
        },
      )
      .post(
        "/session/:id/revert",
        describeRoute({
          description: "Revert a message",
          operationId: "session.revert",
          responses: {
            200: {
              description: "Updated session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        validator("json", SessionRevert.RevertInput.omit({ sessionID: true })),
        async (c) => {
          const id = c.req.valid("param").id
          log.info("revert", c.req.valid("json"))
          const session = await SessionRevert.revert({ sessionID: id, ...c.req.valid("json") })
          return c.json(session)
        },
      )
      .post(
        "/session/:id/unrevert",
        describeRoute({
          description: "Restore all reverted messages",
          operationId: "session.unrevert",
          responses: {
            200: {
              description: "Updated session",
              content: {
                "application/json": {
                  schema: resolver(Session.Info),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        async (c) => {
          const id = c.req.valid("param").id
          const session = await SessionRevert.unrevert({ sessionID: id })
          return c.json(session)
        },
      )
      .post(
        "/session/:id/permissions/:permissionID",
        describeRoute({
          description: "Respond to a permission request",
          responses: {
            200: {
              description: "Permission processed successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
            permissionID: z.string(),
          }),
        ),
        validator("json", z.object({ response: Permission.Response })),
        async (c) => {
          const params = c.req.valid("param")
          const id = params.id
          const permissionID = params.permissionID
          Permission.respond({ sessionID: id, permissionID, response: c.req.valid("json").response })
          return c.json(true)
        },
      )
      .get(
        "/command",
        describeRoute({
          description: "List all commands",
          operationId: "command.list",
          responses: {
            200: {
              description: "List of commands",
              content: {
                "application/json": {
                  schema: resolver(Command.Info.array()),
                },
              },
            },
          },
        }),
        async (c) => {
          const commands = await Command.list()
          return c.json(commands)
        },
      )
      .get(
        "/config/providers",
        describeRoute({
          description: "List all providers",
          operationId: "config.providers",
          responses: {
            200: {
              description: "List of providers",
              content: {
                "application/json": {
                  schema: resolver(
                    z.object({
                      providers: ModelsDev.Provider.array(),
                      default: z.record(z.string(), z.string()),
                    }),
                  ),
                },
              },
            },
          },
        }),
        async (c) => {
          const providers = await Provider.list().then((x) => mapValues(x, (item) => item.info))
          return c.json({
            providers: Object.values(providers),
            default: mapValues(providers, (item) => Provider.sort(Object.values(item.models))[0].id),
          })
        },
      )
      .get(
        "/find",
        describeRoute({
          description: "Find text in files",
          operationId: "find.text",
          responses: {
            200: {
              description: "Matches",
              content: {
                "application/json": {
                  schema: resolver(Ripgrep.Match.shape.data.array()),
                },
              },
            },
          },
        }),
        validator(
          "query",
          z.object({
            pattern: z.string(),
          }),
        ),
        async (c) => {
          const pattern = c.req.valid("query").pattern
          const result = await Ripgrep.search({
            cwd: Instance.directory,
            pattern,
            limit: 10,
          })
          return c.json(result)
        },
      )
      .get(
        "/find/file",
        describeRoute({
          description: "Find files",
          operationId: "find.files",
          responses: {
            200: {
              description: "File paths",
              content: {
                "application/json": {
                  schema: resolver(z.string().array()),
                },
              },
            },
          },
        }),
        validator(
          "query",
          z.object({
            query: z.string(),
          }),
        ),
        async (c) => {
          const query = c.req.valid("query").query
          const result = await Ripgrep.files({
            cwd: Instance.directory,
            query,
            limit: 10,
          })
          return c.json(result)
        },
      )
      .get(
        "/find/symbol",
        describeRoute({
          description: "Find workspace symbols",
          operationId: "find.symbols",
          responses: {
            200: {
              description: "Symbols",
              content: {
                "application/json": {
                  schema: resolver(LSP.Symbol.array()),
                },
              },
            },
          },
        }),
        validator(
          "query",
          z.object({
            query: z.string(),
          }),
        ),
        async (c) => {
          const query = c.req.valid("query").query
          const result = await LSP.workspaceSymbol(query)
          return c.json(result)
        },
      )
      .get(
        "/file",
        describeRoute({
          description: "List files and directories",
          operationId: "file.list",
          responses: {
            200: {
              description: "Files and directories",
              content: {
                "application/json": {
                  schema: resolver(File.Node.array()),
                },
              },
            },
          },
        }),
        validator(
          "query",
          z.object({
            path: z.string(),
          }),
        ),
        async (c) => {
          const path = c.req.valid("query").path
          const content = await File.list(path)
          return c.json(content)
        },
      )
      .get(
        "/file/content",
        describeRoute({
          description: "Read a file",
          operationId: "file.read",
          responses: {
            200: {
              description: "File content",
              content: {
                "application/json": {
                  schema: resolver(File.Content),
                },
              },
            },
          },
        }),
        validator(
          "query",
          z.object({
            path: z.string(),
          }),
        ),
        async (c) => {
          const path = c.req.valid("query").path
          const content = await File.read(path)
          return c.json(content)
        },
      )
      .get(
        "/file/status",
        describeRoute({
          description: "Get file status",
          operationId: "file.status",
          responses: {
            200: {
              description: "File status",
              content: {
                "application/json": {
                  schema: resolver(File.Info.array()),
                },
              },
            },
          },
        }),
        async (c) => {
          const content = await File.status()
          return c.json(content)
        },
      )
      .post(
        "/log",
        describeRoute({
          description: "Write a log entry to the server logs",
          operationId: "app.log",
          responses: {
            200: {
              description: "Log entry written successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "json",
          z.object({
            service: z.string().meta({ description: "Service name for the log entry" }),
            level: z.enum(["debug", "info", "error", "warn"]).meta({ description: "Log level" }),
            message: z.string().meta({ description: "Log message" }),
            extra: z
              .record(z.string(), z.any())
              .optional()
              .meta({ description: "Additional metadata for the log entry" }),
          }),
        ),
        async (c) => {
          const { service, level, message, extra } = c.req.valid("json")
          const logger = Log.create({ service })

          switch (level) {
            case "debug":
              logger.debug(message, extra)
              break
            case "info":
              logger.info(message, extra)
              break
            case "error":
              logger.error(message, extra)
              break
            case "warn":
              logger.warn(message, extra)
              break
          }

          return c.json(true)
        },
      )
      .get(
        "/agent",
        describeRoute({
          description: "List all agents",
          operationId: "app.agents",
          responses: {
            200: {
              description: "List of agents",
              content: {
                "application/json": {
                  schema: resolver(Agent.Info.array()),
                },
              },
            },
          },
        }),
        async (c) => {
          const modes = await Agent.list()
          return c.json(modes)
        },
      )
      .post(
        "/tui/append-prompt",
        describeRoute({
          description: "Append prompt to the TUI",
          operationId: "tui.appendPrompt",
          responses: {
            200: {
              description: "Prompt processed successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "json",
          z.object({
            text: z.string(),
          }),
        ),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/open-help",
        describeRoute({
          description: "Open the help dialog",
          operationId: "tui.openHelp",
          responses: {
            200: {
              description: "Help dialog opened successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/open-sessions",
        describeRoute({
          description: "Open the session dialog",
          operationId: "tui.openSessions",
          responses: {
            200: {
              description: "Session dialog opened successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/open-themes",
        describeRoute({
          description: "Open the theme dialog",
          operationId: "tui.openThemes",
          responses: {
            200: {
              description: "Theme dialog opened successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/open-models",
        describeRoute({
          description: "Open the model dialog",
          operationId: "tui.openModels",
          responses: {
            200: {
              description: "Model dialog opened successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/submit-prompt",
        describeRoute({
          description: "Submit the prompt",
          operationId: "tui.submitPrompt",
          responses: {
            200: {
              description: "Prompt submitted successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/clear-prompt",
        describeRoute({
          description: "Clear the prompt",
          operationId: "tui.clearPrompt",
          responses: {
            200: {
              description: "Prompt cleared successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/execute-command",
        describeRoute({
          description: "Execute a TUI command (e.g. agent_cycle)",
          operationId: "tui.executeCommand",
          responses: {
            200: {
              description: "Command executed successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "json",
          z.object({
            command: z.string(),
          }),
        ),
        async (c) => c.json(await callTui(c)),
      )
      .post(
        "/tui/show-toast",
        describeRoute({
          description: "Show a toast notification in the TUI",
          operationId: "tui.showToast",
          responses: {
            200: {
              description: "Toast notification shown successfully",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
          },
        }),
        validator(
          "json",
          z.object({
            title: z.string().optional(),
            message: z.string(),
            variant: z.enum(["info", "success", "warning", "error"]),
          }),
        ),
        async (c) => c.json(await callTui(c)),
      )
      .route("/tui/control", TuiRoute)
      .put(
        "/auth/:id",
        describeRoute({
          description: "Set authentication credentials",
          operationId: "auth.set",
          responses: {
            200: {
              description: "Successfully set authentication credentials",
              content: {
                "application/json": {
                  schema: resolver(z.boolean()),
                },
              },
            },
            ...ERRORS,
          },
        }),
        validator(
          "param",
          z.object({
            id: z.string(),
          }),
        ),
        validator("json", Auth.Info),
        async (c) => {
          const id = c.req.valid("param").id
          const info = c.req.valid("json")
          await Auth.set(id, info)
          return c.json(true)
        },
      )
      .get(
        "/event",
        describeRoute({
          description: "Get events",
          operationId: "event.subscribe",
          responses: {
            200: {
              description: "Event stream",
              content: {
                "text/event-stream": {
                  schema: resolver(
                    Bus.payloads().meta({
                      ref: "Event",
                    }),
                  ),
                },
              },
            },
          },
        }),
        async (c) => {
          log.info("event connected")
          return streamSSE(c, async (stream) => {
            stream.writeSSE({
              data: JSON.stringify({
                type: "server.connected",
                properties: {},
              }),
            })
            const unsub = Bus.subscribeAll(async (event) => {
              await stream.writeSSE({
                data: JSON.stringify(event),
              })
            })
            await new Promise<void>((resolve) => {
              stream.onAbort(() => {
                unsub()
                resolve()
                log.info("event disconnected")
              })
            })
          })
        },
      ),
  )

  export async function openapi() {
    const result = await generateSpecs(App(), {
      documentation: {
        info: {
          title: "sgptcoder",
          version: "1.0.0",
          description: "sgptcoder api",
        },
        openapi: "3.1.1",
      },
    })
    return result
  }

  export function listen(opts: { port: number; hostname: string }) {
    const server = Bun.serve({
      port: opts.port,
      hostname: opts.hostname,
      idleTimeout: 0,
      fetch: App().fetch,
    })
    return server
  }
}
