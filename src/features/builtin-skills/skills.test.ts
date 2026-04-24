import { describe, test, expect } from "bun:test"
import { createBuiltinSkills } from "./skills"

describe("createBuiltinSkills", () => {
	test("returns agent-browser skill by default", () => {
		const skills = createBuiltinSkills()
		const browserSkill = skills.find((s) => s.name === "agent-browser")

		expect(browserSkill).toBeDefined()
		expect(browserSkill!.description).toContain("browser")
		expect(browserSkill!.allowedTools).toContain("Bash(agent-browser:*)")
	})

	test("returns agent-browser skill when browserProvider is set", () => {
		const skills = createBuiltinSkills({ browserProvider: "agent-browser" })
		const browserSkill = skills.find((s) => s.name === "agent-browser")

		expect(browserSkill).toBeDefined()
		expect(browserSkill!.template).toContain("agent-browser open")
	})

	test("always includes the remaining builtin skills", () => {
		const skills = createBuiltinSkills()

		expect(skills.find((s) => s.name === "agent-browser")).toBeDefined()
		expect(skills.find((s) => s.name === "frontend-ui-ux")).toBeDefined()
		expect(skills.find((s) => s.name === "git-master")).toBeDefined()
		expect(skills.find((s) => s.name === "review-work")).toBeDefined()
	})

	test("returns exactly 4 skills", () => {
		expect(createBuiltinSkills()).toHaveLength(4)
		expect(createBuiltinSkills({ browserProvider: "agent-browser" })).toHaveLength(4)
	})

	test("filters disabled skills", () => {
		const skills = createBuiltinSkills({
			disabledSkills: new Set(["agent-browser", "git-master"]),
		})

		expect(skills.map((s) => s.name)).not.toContain("agent-browser")
		expect(skills.map((s) => s.name)).not.toContain("git-master")
		expect(skills.map((s) => s.name)).toContain("frontend-ui-ux")
		expect(skills.map((s) => s.name)).toContain("review-work")
		expect(skills).toHaveLength(2)
	})

	test("returns an empty array when all remaining skills are disabled", () => {
		const skills = createBuiltinSkills({
			disabledSkills: new Set(["agent-browser", "frontend-ui-ux", "git-master", "review-work"]),
		})

		expect(skills).toHaveLength(0)
	})

	test("agent-browser skill template is inlined", () => {
		const skills = createBuiltinSkills()
		const browserSkill = skills.find((s) => s.name === "agent-browser")

		expect(browserSkill!.template).toContain("## Quick start")
		expect(browserSkill!.template).toContain("## Commands")
		expect(browserSkill!.template).toContain("agent-browser snapshot")
	})

	test("review-work skill has correct structure", () => {
		const skills = createBuiltinSkills()
		const reviewWork = skills.find((s) => s.name === "review-work")

		expect(reviewWork).toBeDefined()
		expect(reviewWork!.description).toContain("review")
		expect(reviewWork!.template).toContain("5-Agent Parallel Review Orchestrator")
		expect(reviewWork!.template).toContain("Security")
	})
})
