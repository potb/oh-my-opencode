/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { buildAgentIdentitySection } from "./dynamic-agent-core-sections"
import { createSisyphusAgent } from "./sisyphus"
import { applyOverrides } from "./builtin-agents/agent-overrides"

describe("buildAgentIdentitySection", () => {
  describe("#given an agent name and role description", () => {
    describe("#when building the identity section", () => {
      it("#then includes the agent name prominently", () => {
        const result = buildAgentIdentitySection("Sisyphus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toContain("Sisyphus")
      })

      it("#then includes the role description", () => {
        const result = buildAgentIdentitySection("Sisyphus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toContain("Powerful AI orchestrator from OhMyOpenCode")
      })

      it("#then wraps content in an identity XML tag", () => {
        const result = buildAgentIdentitySection("Oracle", "Strategic advisor")

        expect(result).toContain("<agent-identity>")
        expect(result).toContain("</agent-identity>")
      })

      it("#then explicitly states this identity overrides any prior identity", () => {
        const result = buildAgentIdentitySection("Sisyphus", "Powerful AI orchestrator from OhMyOpenCode")

        expect(result).toMatch(/override|supersede|replace|disregard|instead of/i)
      })
    })
  })

  describe("#given different agent names", () => {
    describe("#when building identity for each", () => {
      it("#then each identity section contains the correct agent name", () => {
        const sisyphus = buildAgentIdentitySection("Sisyphus", "AI orchestrator")
        const oracle = buildAgentIdentitySection("Oracle", "Strategic advisor")

        expect(sisyphus).toContain("Sisyphus")
        expect(sisyphus).not.toContain("Oracle")
        expect(oracle).toContain("Oracle")
        expect(oracle).not.toContain("Sisyphus")
      })
    })
  })
})

describe("Sisyphus prompt identity", () => {
  describe("#given a Sisyphus agent created with default model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section with override directive", () => {
        const config = createSisyphusAgent("anthropic/claude-opus-4-6")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Sisyphus")
        expect(config.prompt).toContain("</agent-identity>")
      })

      it("#then identity section appears before the Role section", () => {
        const config = createSisyphusAgent("anthropic/claude-opus-4-6")
        const prompt = config.prompt ?? ""
        const identityIndex = prompt.indexOf("<agent-identity>")
        const roleIndex = prompt.indexOf("<Role>")

        expect(identityIndex).toBeGreaterThanOrEqual(0)
        expect(roleIndex).toBeGreaterThan(identityIndex)
      })
    })
  })

  describe("#given a Sisyphus agent created with GPT-5.4 model", () => {
    describe("#when checking the prompt", () => {
      it("#then contains the agent identity section", () => {
        const config = createSisyphusAgent("openai/gpt-5.4")

        expect(config.prompt).toContain("<agent-identity>")
        expect(config.prompt).toContain("Sisyphus")
        expect(config.prompt).toContain("</agent-identity>")
      })
    })
  })
})

describe("Agent identity preservation through overrides", () => {
  describe("#given a Sisyphus agent with prompt_append override", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved in the merged prompt", () => {
        const baseConfig = createSisyphusAgent("anthropic/claude-opus-4-6")
        const merged = applyOverrides(baseConfig, { prompt_append: "Extra instructions here" }, {})

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Sisyphus")
        expect(merged.prompt).toContain("</agent-identity>")
        expect(merged.prompt).toContain("Extra instructions here")
      })
    })
  })

  describe("#given a Sisyphus agent with model override only", () => {
    describe("#when merging the override", () => {
      it("#then identity section is preserved unchanged", () => {
        const baseConfig = createSisyphusAgent("anthropic/claude-opus-4-6")
        const merged = applyOverrides(baseConfig, { model: "openai/gpt-5.4" }, {})

        expect(merged.prompt).toContain("<agent-identity>")
        expect(merged.prompt).toContain("Sisyphus")
        expect(merged.prompt).toContain("</agent-identity>")
      })
    })
  })
})
