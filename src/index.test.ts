import { describe, expect, it, mock } from "bun:test"

describe("experimental.session.compacting handler", () => {
  function createCompactingHandler(hooks: {
    compactionContextInjector?: {
      capture: (sessionID: string) => Promise<void>
      inject: (sessionID: string) => string
    }
    compactionTodoPreserver?: { capture: (sessionID: string) => Promise<void> }
  }) {
    return async (
      input: { sessionID: string },
      output: { context: string[] },
    ): Promise<void> => {
      await hooks.compactionContextInjector?.capture(input.sessionID)
      await hooks.compactionTodoPreserver?.capture(input.sessionID)
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
    })

    const output = { context: [] as string[] }
    await handler({ sessionID: "ses_test" }, output)

    expect(callOrder).toEqual(["checkpointCapture", "capture", "contextInjector"])
    expect(output.context).toEqual(["context-for-ses_test"])
  })

  it("handles missing optional compaction hooks gracefully", async () => {
    const handler = createCompactingHandler({})

    const output = { context: [] as string[] }
    await handler({ sessionID: "ses_test" }, output)

    expect(output.context).toEqual([])
  })
})
