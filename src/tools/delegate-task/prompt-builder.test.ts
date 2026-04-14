declare const require: (name: string) => unknown
const { describe, test, expect } = require("bun:test") as {
  describe: (name: string, fn: () => void) => void
  test: (name: string, fn: () => void) => void
  expect: (value: unknown) => {
    toBe: (expected: unknown) => void
    toContain: (expected: string) => void
    toBeUndefined: () => void
    toBeDefined: () => void
    not: {
      toContain: (expected: string) => void
      toBeUndefined: () => void
    }
  }
}

import { buildSystemContent } from "./prompt-builder"
import type { AvailableSkill, AvailableCategory } from "../../agents/dynamic-agent-prompt-builder"

describe("prompt-builder", () => {
  describe("buildSystemContent", () => {
    describe("#given non-plan agent with availableSkills", () => {
      test("#when availableSkills contains project-level skills #then system content may be omitted without a skills section", () => {
        // given
        const availableSkills: AvailableSkill[] = [
          { name: "git-master", description: "Git workflow automation", location: "plugin" },
          { name: "my-project-skill", description: "Project-specific deployment", location: "project" },
        ]
        const availableCategories: AvailableCategory[] = [
          { name: "quick", description: "Trivial tasks", model: "openai/gpt-5.4-mini" },
        ]

        // when
        const result = buildSystemContent({
          agentName: "sisyphus-junior",
          availableSkills,
          availableCategories,
        })

        // then
        expect(result).toBeUndefined()
      })

      test("#when agent is explore #then system content remains undefined without skills section", () => {
        // given
        const availableSkills: AvailableSkill[] = [
          { name: "code-review", description: "Review code quality", location: "project" },
        ]

        // when
        const result = buildSystemContent({
          agentName: "explore",
          availableSkills,
        })

        // then
        expect(result).toBeUndefined()
      })

      test("#when availableSkills is empty #then system content does not include available_skills section", () => {
        // given
        const availableSkills: AvailableSkill[] = []

        // when
        const result = buildSystemContent({
          agentName: "sisyphus-junior",
          availableSkills,
          categoryPromptAppend: "some category context",
        })

        // then
        expect(result).toBeDefined()
        expect(result).not.toContain("available_skills")
      })
    })

    describe("#given plan agent with availableSkills", () => {
      test("#when availableSkills provided #then system content includes plan agent prepend and no non-plan skills section", () => {
        // given
        const availableSkills: AvailableSkill[] = [
          { name: "git-master", description: "Git workflow automation", location: "plugin" },
        ]
        const availableCategories: AvailableCategory[] = [
          { name: "quick", description: "Trivial tasks", model: "openai/gpt-5.4-mini" },
        ]

        // when
        const result = buildSystemContent({
          agentName: "plan",
          availableSkills,
          availableCategories,
        })

        // then
        expect(result).toBeDefined()
        expect(result).toContain("git-master")
        expect(result).toContain("Task Dependency Graph")
      })
    })

    describe("#given non-plan agent with agentsContext override", () => {
      test("#when agentsContext is provided #then it takes precedence without appending skills section", () => {
        // given
        const availableSkills: AvailableSkill[] = [
          { name: "deploy-skill", description: "Deployment automation", location: "project" },
        ]

        // when
        const result = buildSystemContent({
          agentName: "sisyphus-junior",
          agentsContext: "Custom agent context here",
          availableSkills,
        })

        // then
        expect(result).toBeDefined()
        expect(result).toContain("Custom agent context here")
        expect(result).not.toContain("deploy-skill")
      })
    })
  })
})
