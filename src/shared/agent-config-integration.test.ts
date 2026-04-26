import { describe, test, expect } from "bun:test"
import { getAgentDisplayName } from "./agent-display-names"

describe("Agent Config Integration", () => {
  describe("Display name resolution", () => {
    test("returns correct display names for supported builtin agents", () => {
      const agents = ["sisyphus", "metis", "momus", "oracle", "librarian", "explore"]

      const displayNames = agents.map((agent) => getAgentDisplayName(agent))

      expect(displayNames).toContain("Sisyphus")
      expect(displayNames).toContain("Metis - Plan Consultant")
      expect(displayNames).toContain("Momus - Plan Critic")
      expect(displayNames).toContain("oracle")
      expect(displayNames).toContain("librarian")
      expect(displayNames).toContain("explore")
    })

    test("returns original key for unknown agents", () => {
      expect(getAgentDisplayName("custom-agent")).toBe("custom-agent")
    })
  })

})
