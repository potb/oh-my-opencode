import { describe, expect, it, mock } from "bun:test"

describe("experimental.session.compacting handler", () => {
  function createCompactingHandler(hooks: {
    compactionContextInjector?: {
      capture: (sessionID: string) => Promise<void>
      inject: (sessionID: string) => string
    }
    compactionTodoPreserver?: { capture: (sessionID: string) => Promise<void> }
    claudeCodeHooks?: {
      "experimental.session.compacting"?: (
        input: { sessionID: string },
        output: { context: string[] },
      ) => Promise<void>
    }
  }) {
    return async (
      input: { sessionID: string },
      output: { context: string[] },
    ): Promise<void> => {
      await hooks.compactionContextInjector?.capture(input.sessionID)
      await hooks.compactionTodoPreserver?.capture(input.sessionID)
      await hooks.claudeCodeHooks?.["experimental.session.compacting"]?.(input, output)
      if (hooks.compactionContextInjector) {
        output.context.push(hooks.compactionContextInjector.inject(input.sessionID))
      }
    }
  }

  it("calls compaction hooks in order and preserves injected context", async () => {
    const callOrder: string[] = []

    const handler = createCompactingHandler({
      compactionContextInjector: {
        capture: mock(async () => {
          callOrder.push("checkpointCapture")
        }),
        inject: mock((sessionID: string) => {
          callOrder.push("contextInjector")
          return `context-for-${sessionID}`
        }),
      },
      compactionTodoPreserver: {
        capture: mock(async () => {
          callOrder.push("capture")
        }),
      },
      claudeCodeHooks: {
        "experimental.session.compacting": mock(async (_input, output) => {
          callOrder.push("preCompact")
          output.context.push("precompact-injected-context")
        }),
      },
    })

    const output = { context: [] as string[] }
    await handler({ sessionID: "ses_test" }, output)

    expect(callOrder).toEqual(["checkpointCapture", "capture", "preCompact", "contextInjector"])
    expect(output.context).toEqual(["precompact-injected-context", "context-for-ses_test"])
  })

  it("handles missing optional compaction hooks gracefully", async () => {
    const preCompactMock = mock(async () => {})

    const handler = createCompactingHandler({
      claudeCodeHooks: {
        "experimental.session.compacting": preCompactMock,
      },
    })

    const output = { context: [] as string[] }
    await handler({ sessionID: "ses_test" }, output)

    expect(preCompactMock).toHaveBeenCalledTimes(1)
    expect(output.context).toEqual([])
  })
})
