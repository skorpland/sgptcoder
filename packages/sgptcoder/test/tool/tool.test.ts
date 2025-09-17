import { describe, expect, test } from "bun:test"
import { GlobTool } from "../../src/tool/glob"
import { ListTool } from "../../src/tool/ls"
import path from "path"
import { Instance } from "../../src/project/instance"

const ctx = {
  sessionID: "test",
  messageID: "",
  toolCallID: "",
  agent: "build",
  abort: AbortSignal.any([]),
  metadata: () => {},
}
const glob = await GlobTool.init()
const list = await ListTool.init()

const projectRoot = path.join(__dirname, "../..")
const fixturePath = path.join(__dirname, "../fixtures/example")

describe("tool.glob", () => {
  test("truncate", async () => {
    await Instance.provide(projectRoot, async () => {
      let result = await glob.execute(
        {
          pattern: "**/*",
          path: "../../node_modules",
        },
        ctx,
      )
      expect(result.metadata.truncated).toBe(true)
    })
  })
  test("basic", async () => {
    await Instance.provide(projectRoot, async () => {
      let result = await glob.execute(
        {
          pattern: "*.json",
          path: undefined,
        },
        ctx,
      )
      expect(result.metadata).toMatchObject({
        truncated: false,
        count: 2,
      })
    })
  })
})

describe("tool.ls", () => {
  test("basic", async () => {
    const result = await Instance.provide(projectRoot, async () => {
      return await list.execute({ path: fixturePath, ignore: [".git"] }, ctx)
    })

    // Normalize absolute path to relative for consistent snapshots
    const normalizedOutput = result.output.replace(fixturePath, "packages/sgptcoder/test/fixtures/example")
    expect(normalizedOutput).toMatchSnapshot()
  })
})
