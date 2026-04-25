import { describe, expect, test } from "bun:test"

const runtimeRequire = require as NodeJS.Require & { cache?: Record<string, unknown> }

function clearRequireCache(modulePath: string): void {
  const resolvedPath = runtimeRequire.resolve(modulePath)
  if (runtimeRequire.cache?.[resolvedPath]) {
    delete runtimeRequire.cache[resolvedPath]
  }
}

function loadToolsModule(): typeof import("./tools") {
  clearRequireCache("./tools")
  return require("./tools") as typeof import("./tools")
}

describe("createDelegateTask", () => {
  test("requires subagent_type for new tasks", async () => {
    const { createDelegateTask } = loadToolsModule()
    const tool = createDelegateTask({ manager: {} as never, client: {} as never, directory: "/tmp" })

    const result = await tool.execute(
      {
        description: "missing agent",
        prompt: "Find the issue",
        run_in_background: false,
      } as Record<string, unknown>,
      {
        sessionID: "ses_parent",
        messageID: "msg_parent",
        agent: "sisyphus",
        abort: new AbortController().signal,
      } as never,
    )

    expect(result).toContain("Must provide subagent_type")
  })
})
