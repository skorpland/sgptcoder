import type { Hooks, Plugin as PluginInstance } from "@skorpland/plugin"
import { Config } from "../config/config"
import { Bus } from "../bus"
import { Log } from "../util/log"
import { createSgptcoderClient } from "@skorpland/sdk"
import { Server } from "../server/server"
import { BunProc } from "../bun"
import { Instance } from "../project/instance"
import { Flag } from "../flag/flag"
import { ToolRegistry } from "../tool/registry"

export namespace Plugin {
  const log = Log.create({ service: "plugin" })

  const state = Instance.state(async () => {
    const client = createSgptcoderClient({
      baseUrl: "http://localhost:4096",
      // @ts-expect-error
      fetch: async (...args) => Server.App().fetch(...args),
    })
    const config = await Config.get()
    const hooks = []
    const input = {
      client,
      project: Instance.project,
      worktree: Instance.worktree,
      directory: Instance.directory,
      $: Bun.$,
      Tool: await import("../tool/tool").then((m) => m.Tool),
      z: await import("zod").then((m) => m.z),
    }
    const plugins = [...(config.plugin ?? [])]
    if (!Flag.SGPTCODER_DISABLE_DEFAULT_PLUGINS) {
      plugins.push("sgptcoder-copilot-auth@0.0.2")
      plugins.push("sgptcoder-anthropic-auth@0.0.2")
    }
    for (let plugin of plugins) {
      log.info("loading plugin", { path: plugin })
      if (!plugin.startsWith("file://")) {
        const [pkg, version] = plugin.split("@")
        plugin = await BunProc.install(pkg, version ?? "latest")
      }
      const mod = await import(plugin)
      for (const [_name, fn] of Object.entries<PluginInstance>(mod)) {
        const init = await fn(input)
        hooks.push(init)
      }
    }

    return {
      hooks,
      input,
    }
  })

  export async function trigger<
    Name extends Exclude<keyof Required<Hooks>, "auth" | "event">,
    Input = Parameters<Required<Hooks>[Name]>[0],
    Output = Parameters<Required<Hooks>[Name]>[1],
  >(name: Name, input: Input, output: Output): Promise<Output> {
    if (!name) return output
    for (const hook of await state().then((x) => x.hooks)) {
      const fn = hook[name]
      if (!fn) continue
      // @ts-expect-error if you feel adventurous, please fix the typing, make sure to bump the try-counter if you
      // give up.
      // try-counter: 2
      await fn(input, output)
    }
    return output
  }

  export async function list() {
    return state().then((x) => x.hooks)
  }

  export async function init() {
    const hooks = await state().then((x) => x.hooks)
    const config = await Config.get()
    for (const hook of hooks) {
      await hook.config?.(config)
      // Let plugins register tools at startup
      await hook["tool.register"]?.(
        {},
        {
          registerHTTP: ToolRegistry.registerHTTP,
          register: ToolRegistry.register,
        },
      )
    }
    Bus.subscribeAll(async (input) => {
      const hooks = await state().then((x) => x.hooks)
      for (const hook of hooks) {
        hook["event"]?.({
          event: input,
        })
      }
    })
  }
}
