const { afterEach, describe, expect, test } = require("bun:test")
const { createToolExecuteBeforeHandler } = require("./tool-execute-before")
const { createToolRegistry } = require("./tool-registry")
const { builtinTools } = require("../tools")

describe("createToolExecuteBeforeHandler", () => {
  test("does not execute subagent question blocker hook for question tool", async () => {
    //#given
    const ctx = {
      client: {
        session: {
          messages: async () => ({ data: [] }),
        },
      },
    }

    const hooks = {
      subagentQuestionBlocker: {
        "tool.execute.before": async () => {
          throw new Error("subagentQuestionBlocker should not run")
        },
      },
    }

    const handler = createToolExecuteBeforeHandler({ ctx, hooks })
    const input = { tool: "question", sessionID: "ses_sub", callID: "call_1" }
    const output = { args: { questions: [] } as Record<string, unknown> }

    //#when
    const run = handler(input, output)

    //#then
    await expect(run).resolves.toBeUndefined()
  })

  describe("task tool subagent_type normalization", () => {
    const emptyHooks = {}

    function createCtxWithSessionMessages(messages: Array<{ info?: { agent?: string; role?: string } }> = []) {
      return {
        client: {
          session: {
            messages: async () => ({ data: messages }),
          },
        },
      }
    }

    test("does not infer a subagent from the removed category argument", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { category: "quick", description: "Test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBeUndefined()
    })

    test("preserves existing subagent_type when explicitly provided", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { subagent_type: "plan", description: "Plan test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("plan")
    })

    test("preserves explicit subagent_type even if a stale category field is present", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { category: "quick", subagent_type: "oracle", description: "Test" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("oracle")
    })

    test("resolves subagent_type from session first message when session_id provided without subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages([
        { info: { role: "user" } },
        { info: { role: "assistant", agent: "explore" } },
        { info: { role: "assistant", agent: "oracle" } },
      ])
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", description: "Continue task", prompt: "fix it" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("explore")
    })

    test("falls back to 'continue' when session has no agent info", async () => {
      //#given
      const ctx = createCtxWithSessionMessages([
        { info: { role: "user" } },
        { info: { role: "assistant" } },
      ])
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", description: "Continue task", prompt: "fix it" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("continue")
    })

    test("preserves subagent_type when session_id is provided with explicit subagent_type", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { session_id: "ses_abc123", subagent_type: "explore", description: "Continue explore" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("explore")
    })

    test("does not modify args for non-task tools", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "bash", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { command: "ls" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBeUndefined()
    })

    test("does not set subagent_type when neither category nor session_id is provided and subagent_type is present", async () => {
      //#given
      const ctx = createCtxWithSessionMessages()
      const handler = createToolExecuteBeforeHandler({ ctx, hooks: emptyHooks })
      const input = { tool: "task", sessionID: "ses_123", callID: "call_1" }
      const output = { args: { subagent_type: "oracle", description: "Oracle task" } as Record<string, unknown> }

      //#when
      await handler(input, output)

      //#then
      expect(output.args.subagent_type).toBe("oracle")
    })
  })
})

describe("createToolRegistry", () => {
  function createRegistryInput(overrides = {}) {
    return {
      ctx: {
        directory: process.cwd(),
        client: {
          session: {
            messages: async () => ({ data: [] }),
          },
        },
      },
      pluginConfig: {
        ...overrides,
      },
      managers: {
        backgroundManager: {},
        tmuxSessionManager: {},
        skillMcpManager: {},
      },
      skillContext: {
        mergedSkills: [],
        availableSkills: [],
        browserProvider: "agent-browser",
        disabledSkills: new Set(),
      },
      availableCategories: [],
    }
  }

  describe("#given max_tools is lower than or equal to builtin tool count", () => {
    describe("#when creating the tool registry", () => {
      test("#then it trims to the exact configured cap", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: Object.keys(builtinTools).length },
          }),
        )

        expect(Object.keys(result.filteredTools)).toHaveLength(Object.keys(builtinTools).length)
      })
    })
  })

  describe("#given max_tools is set below the full plugin tool count", () => {
    describe("#when creating the tool registry", () => {
      test("#then it enforces the exact cap deterministically", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: 10 },
          }),
        )

        expect(Object.keys(result.filteredTools)).toHaveLength(10)
      })

      test("#then it keeps the task tool when lower-priority tools can satisfy the cap", () => {
        const result = createToolRegistry(
          createRegistryInput({
            experimental: { max_tools: 10 },
          }),
        )

        expect(result.filteredTools.task).toBeDefined()
      })
    })
  })
})

export {}
