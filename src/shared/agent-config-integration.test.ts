import { describe, test, expect } from "bun:test"
import { migrateAgentNames } from "./migration"
import { getAgentDisplayName } from "./agent-display-names"
import { AGENT_MODEL_REQUIREMENTS } from "./model-requirements"

describe("Agent Config Integration", () => {
  describe("Old format config migration", () => {
    test("migrates old format agent keys to lowercase", () => {
      const oldConfig = {
        Sisyphus: { model: "anthropic/claude-opus-4-6" },
        "Metis - Plan Consultant": { model: "anthropic/claude-sonnet-4-6" },
        "Momus - Plan Critic": { model: "anthropic/claude-sonnet-4-6" },
      }

      const result = migrateAgentNames(oldConfig)

      expect(result.migrated).toHaveProperty("sisyphus")
      expect(result.migrated).toHaveProperty("metis")
      expect(result.migrated).toHaveProperty("momus")
      expect(result.migrated).not.toHaveProperty("Sisyphus")
      expect(result.migrated.sisyphus).toEqual({ model: "anthropic/claude-opus-4-6" })
      expect(result.changed).toBe(true)
    })

    test("preserves already lowercase keys", () => {
      const config = {
        sisyphus: { model: "anthropic/claude-opus-4-6" },
        oracle: { model: "openai/gpt-5.4" },
        librarian: { model: "opencode/big-pickle" },
      }

      const result = migrateAgentNames(config)

      expect(result.migrated).toEqual(config)
      expect(result.changed).toBe(false)
    })
  })

  describe("Display name resolution", () => {
    test("returns correct display names for supported builtin agents", () => {
      const agents = ["sisyphus", "metis", "momus", "oracle", "librarian", "explore"]

      const displayNames = agents.map((agent) => getAgentDisplayName(agent))

      expect(displayNames).toContain("Sisyphus - Ultraworker")
      expect(displayNames).toContain("Metis - Plan Consultant")
      expect(displayNames).toContain("Momus - Plan Critic")
      expect(displayNames).toContain("oracle")
      expect(displayNames).toContain("librarian")
      expect(displayNames).toContain("explore")
    })

    test("returns original key for removed atlas", () => {
      expect(getAgentDisplayName("atlas")).toBe("atlas")
    })
  })

  describe("Model requirements integration", () => {
    test("all model requirements use lowercase keys", () => {
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)
      const allLowercase = agentKeys.every((key) => key === key.toLowerCase())

      expect(allLowercase).toBe(true)
    })

    test("model requirements include all supported builtin agents", () => {
      const expectedAgents = ["sisyphus", "metis", "momus", "oracle", "librarian", "explore", "sisyphus-junior"]
      const agentKeys = Object.keys(AGENT_MODEL_REQUIREMENTS)

      for (const agent of expectedAgents) {
        expect(agentKeys).toContain(agent)
      }
      expect(agentKeys).not.toContain("atlas")
    })
  })
})
