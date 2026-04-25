const { describe, expect, test } = require("bun:test")

function requireFresh(modulePath: string) {
  const resolvedPath = require.resolve(modulePath)
  if (require.cache?.[resolvedPath]) {
    delete require.cache[resolvedPath]
  }
  return require(modulePath)
}

function createDelegateTask(...args: Parameters<typeof import("./tools").createDelegateTask>) {
  return requireFresh("./tools").createDelegateTask(...args)
}

describe("createDelegateTask schema", () => {
  test("exposes the fixed-product direct-subagent contract", () => {
    const toolDefinition = createDelegateTask({
      manager: {} as never,
      client: {} as never,
      directory: "/tmp/test",
    })

    expect(toolDefinition.args).not.toHaveProperty("category")
    expect(toolDefinition.args).toHaveProperty("subagent_type")
    expect(toolDefinition.args).toHaveProperty("prompt")
    expect(toolDefinition.args).toHaveProperty("run_in_background")
    expect(toolDefinition.args).toHaveProperty("session_id")
  })

  test("describes direct subagent delegation", () => {
    const toolDefinition = createDelegateTask({
      manager: {} as never,
      client: {} as never,
      directory: "/tmp/test",
    })

    expect(toolDefinition.description).toContain("subagent_type: Direct target agent name")
    expect(toolDefinition.description).toContain("Prompts must be in English")
  })
})

export {}
