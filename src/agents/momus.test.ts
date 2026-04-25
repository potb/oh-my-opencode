import { describe, test, expect } from "bun:test"
import { createMomusAgent } from "./momus"

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

describe("Momus prompt policy requirements", () => {
  test("should treat SYSTEM DIRECTIVE as ignorable/stripped", () => {
    // given
    const prompt = createMomusAgent("anthropic/claude-sonnet-4-6").prompt ?? ""
    
    // when / #then
    // Should mention that system directives are ignored
    expect(prompt.toLowerCase()).toMatch(/system directive.*ignore|ignore.*system directive/)
    // Should give examples of system directive patterns
    expect(prompt).toMatch(/<system-reminder>|system-reminder/)
  })

  test("should extract paths containing .sisyphus/plans/ and ending in .md", () => {
    // given
    const prompt = createMomusAgent("anthropic/claude-sonnet-4-6").prompt ?? ""

    // when / #then
    expect(prompt).toContain(".sisyphus/plans/")
    expect(prompt).toContain(".md")
    // New extraction policy should be mentioned
    expect(prompt.toLowerCase()).toMatch(/extract|search|find path/)
  })

  test("should NOT teach that 'Please review' is INVALID (conversational wrapper allowed)", () => {
    // given
    const prompt = createMomusAgent("anthropic/claude-sonnet-4-6").prompt ?? ""

    // when / #then
    // In RED phase, this will FAIL because current prompt explicitly lists this as INVALID
    const invalidExample = "Please review .sisyphus/plans/plan.md"
    const rejectionTeaching = new RegExp(
      `reject.*${escapeRegExp(invalidExample)}`,
      "i",
    )
    
    // We want the prompt to NOT reject this anymore. 
    // If it's still in the "INVALID" list, this test should fail.
    expect(prompt).not.toMatch(rejectionTeaching)
  })

  test("should handle ambiguity (2+ paths) and 'no path found' rejection", () => {
    // given
    const prompt = createMomusAgent("anthropic/claude-sonnet-4-6").prompt ?? ""

    // when / #then
    // Should mention what happens when multiple paths are found
    expect(prompt.toLowerCase()).toMatch(/multiple|ambiguous|2\+|two/)
    // Should mention rejection if no path found
    expect(prompt.toLowerCase()).toMatch(/no.*path.*found|reject.*no.*path/)
  })
})
