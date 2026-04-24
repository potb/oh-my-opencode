import { describe, expect, it } from "bun:test"
import { createToolExecuteAfterHandler } from "./tool-execute-after"

type ToolExecuteAfterOutput = {
  title: string
  output: string
  metadata: Record<string, unknown>
}

type ToolExecuteAfterInput = {
  tool: string
  sessionID: string
  callID: string
}

describe("createToolExecuteAfterHandler", () => {
  it("#given truncator changes output #when tool.execute.after runs #then later hooks receive truncated output", async () => {
    const callOrder: string[] = []
    let detectorSawOutput = ""

    const handler = createToolExecuteAfterHandler({
      ctx: { directory: "/repo" } as never,
      hooks: {
        toolOutputTruncator: {
          "tool.execute.after": async (_input: ToolExecuteAfterInput, output: ToolExecuteAfterOutput) => {
            callOrder.push("truncator")
            output.output = "truncated output"
          },
        },
        emptyTaskResponseDetector: {
          "tool.execute.after": async (_input: ToolExecuteAfterInput, output: ToolExecuteAfterOutput) => {
            callOrder.push("emptyTaskResponseDetector")
            detectorSawOutput = output.output
          },
        },
      } as never,
    })

    await handler(
      { tool: "hashline_edit", sessionID: "ses_test", callID: "call_test" },
      { title: "result", output: "original output", metadata: {} }
    )

    expect(callOrder).toEqual(["truncator", "emptyTaskResponseDetector"])
    expect(detectorSawOutput).toBe("truncated output")
  })

  it("runs later hooks after truncation", async () => {
    const callOrder: string[] = []

    const handler = createToolExecuteAfterHandler({
      ctx: { directory: "/repo" } as never,
      hooks: {
        toolOutputTruncator: {
          "tool.execute.after": async () => {
            callOrder.push("truncator")
          },
        },
        emptyTaskResponseDetector: {
          "tool.execute.after": async () => {
            callOrder.push("emptyTaskResponseDetector")
          },
        },
        hashlineReadEnhancer: {
          "tool.execute.after": async () => {
            callOrder.push("hashlineReadEnhancer")
          },
        },
      } as never,
    })

    await handler(
      { tool: "read", sessionID: "ses_test", callID: "call_test" },
      { title: "result", output: "original output", metadata: {} },
    )

    expect(callOrder).toEqual(["truncator", "emptyTaskResponseDetector", "hashlineReadEnhancer"])
  })
})
