import { describe, expect, it } from "bun:test"

describe("experimental.session.compacting handler", () => {
  function createCompactingHandler() {
    return async (_input: { sessionID: string }, output: { context: string[] }): Promise<void> => {
      void _input
      void output
    }
  }

  it("leaves compaction output unchanged", async () => {
    const handler = createCompactingHandler()

    const output = { context: ["existing"] as string[] }
    await handler({ sessionID: "ses_test" }, output)

    expect(output.context).toEqual(["existing"])
  })
})
