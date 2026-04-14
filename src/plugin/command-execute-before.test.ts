import { describe, expect, mock, test } from "bun:test"

import { createCommandExecuteBeforeHandler } from "./command-execute-before"

describe("createCommandExecuteBeforeHandler", () => {
  test("is a no-op for the trimmed fixed-product runtime", async () => {
    const startLoop = mock(() => true)
    const startWorkHook = mock(async () => {})
    const clear = mock(() => {})

    const handler = createCommandExecuteBeforeHandler({
      hooks: {
        ralphLoop: {
          startLoop,
          cancelLoop: mock(() => true),
        },
        startWork: {
          "command.execute.before": startWorkHook,
        },
        stopContinuationGuard: {
          isStopped: mock(() => true),
          clear,
        },
      } as never,
    })

    const output = { parts: [], message: {} as Record<string, unknown> }
    await handler(
      {
        command: "ulw-loop",
        sessionID: "ses-trimmed",
        arguments: "Ship feature",
      },
      output,
    )

    expect(startLoop).not.toHaveBeenCalled()
    expect(startWorkHook).not.toHaveBeenCalled()
    expect(clear).not.toHaveBeenCalled()
    expect(output).toEqual({ parts: [], message: {} })
  })
})
