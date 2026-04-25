import { describe, test, expect } from "bun:test"
import {
  resolvePromptContextFromSessionMessages,
} from "./compaction-aware-message-resolver"
import { isCompactionAgent } from "../../shared/compaction-marker"

describe("isCompactionAgent", () => {
  describe("#given agent name variations", () => {
    test("returns true for 'compaction'", () => {
      // when
      const result = isCompactionAgent("compaction")

      // then
      expect(result).toBe(true)
    })

    test("returns true for 'Compaction' (case insensitive)", () => {
      // when
      const result = isCompactionAgent("Compaction")

      // then
      expect(result).toBe(true)
    })

    test("returns true for ' compaction ' (with whitespace)", () => {
      // when
      const result = isCompactionAgent(" compaction ")

      // then
      expect(result).toBe(true)
    })

    test("returns false for undefined", () => {
      // when
      const result = isCompactionAgent(undefined)

      // then
      expect(result).toBe(false)
    })

    test("returns false for null", () => {
      // when
      const result = isCompactionAgent(null as unknown as string)

      // then
      expect(result).toBe(false)
    })

    test("returns false for non-compaction agent like 'sisyphus'", () => {
      // when
      const result = isCompactionAgent("sisyphus")

      // then
      expect(result).toBe(false)
    })
  })
})

describe("resolvePromptContextFromSessionMessages", () => {
  test("returns the first recent SDK message that already has context", () => {
    // given
    const messages = [
      { info: { agent: "custom-agent" } },
      { info: { model: { providerID: "anthropic", modelID: "claude-opus-4-1" } } },
      { info: { tools: { bash: true } } },
    ]

    // when
    const result = resolvePromptContextFromSessionMessages(messages)

    // then
    expect(result).toEqual({
      tools: { bash: true },
    })
  })

  test("skips compaction markers and returns the first remaining message with context", () => {
    // given
    const messages = [
      {
        id: "msg_compaction",
        info: { agent: "custom-agent", model: { providerID: "openai", modelID: "gpt-5" } },
        parts: [{ type: "compaction" }],
      },
      { info: { agent: "sisyphus" } },
      { info: { model: { providerID: "anthropic", modelID: "claude-opus-4-1" } } },
      { info: { tools: { bash: true } } },
    ]

    // when
    const result = resolvePromptContextFromSessionMessages(messages)

    // then
    expect(result).toEqual({
      tools: { bash: true },
    })
  })
})
