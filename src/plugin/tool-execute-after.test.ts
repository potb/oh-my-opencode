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
        webfetchRedirectGuard: {
          "tool.execute.after": async () => {
            callOrder.push("webfetchRedirectGuard")
          },
        },
      } as never,
    })

    await handler(
      { tool: "read", sessionID: "ses_test", callID: "call_test" },
      { title: "result", output: "original output", metadata: {} },
    )

    expect(callOrder).toEqual(["truncator", "webfetchRedirectGuard"])
  })
})
