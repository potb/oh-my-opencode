import { describe, test, expect } from "bun:test"
import { buildSystemContentWithTokenLimit } from "./token-limiter"

describe("token-limiter", () => {
  test("buildSystemContentWithTokenLimit returns undefined when there is no content", () => {
    // given
    const input = {
      skillContent: undefined,
      skillContents: [],
      categoryPromptAppend: undefined,
      agentsContext: undefined,
      planAgentPrepend: "",
    }

    // when
    const result = buildSystemContentWithTokenLimit(input, 20)

    // then
    expect(result).toBeUndefined()
  })

  test("buildSystemContentWithTokenLimit truncates skills before category and agents context", () => {
    // given
    const input = {
      skillContents: [
        "SKILL_ALPHA:" + "a".repeat(180),
        "SKILL_BETA:" + "b".repeat(180),
      ],
      categoryPromptAppend: "CATEGORY_APPEND:keep",
      agentsContext: "AGENTS_CONTEXT:keep",
      planAgentPrepend: "",
    }

    // when
    const result = buildSystemContentWithTokenLimit(input, 80) as string

    // then
    expect(result).toContain("AGENTS_C")
    expect(result).toContain("CATE")
    expect(result).toContain("SKILL_ALPHA:")
    // 4 chars per token approximation, allow for truncation marker overhead (~3 tokens)
    expect(Math.ceil(result.length / 4)).toBeLessThanOrEqual(80 + 3)
  })

  test("buildSystemContentWithTokenLimit truncates category after skills are exhausted", () => {
    // given
    const input = {
      skillContents: ["SKILL_ALPHA:" + "a".repeat(220)],
      categoryPromptAppend: "CATEGORY_APPEND:" + "c".repeat(220),
      agentsContext: "AGENTS_CONTEXT:keep",
      planAgentPrepend: "",
    }

    // when
    const result = buildSystemContentWithTokenLimit(input, 30) as string

    // then
    expect(result).toContain("AGENTS_C")
    expect(result).not.toContain("SKILL_ALPHA:" + "a".repeat(80))
    expect(Math.ceil(result.length / 4)).toBeLessThanOrEqual(30 + 3)
  })

  test("buildSystemContentWithTokenLimit truncates agents context last", () => {
    // given
    const input = {
      skillContents: ["SKILL_ALPHA:" + "a".repeat(220)],
      categoryPromptAppend: "CATEGORY_APPEND:" + "c".repeat(220),
      agentsContext: "AGENTS_CONTEXT:" + "g".repeat(220),
      planAgentPrepend: "",
    }

    // when
    const result = buildSystemContentWithTokenLimit(input, 10) as string

    // then
    expect(result).toContain("AGENTS_CONTEXT:")
    expect(result).not.toContain("SKILL_ALPHA:")
    expect(result).not.toContain("CATEGORY_APPEND:")
    expect(Math.ceil(result.length / 4)).toBeLessThanOrEqual(10 + 3)
  })
})
