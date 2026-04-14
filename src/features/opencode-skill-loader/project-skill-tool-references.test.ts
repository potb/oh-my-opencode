/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const PROJECT_ROOT = fileURLToPath(new URL("../../..", import.meta.url))

async function readProjectSkill(...segments: string[]) {
  return Bun.file(join(PROJECT_ROOT, ".opencode", "skills", ...segments, "SKILL.md")).text()
}

describe("project skill tool references", () => {
  describe("#given work-with-pr skill instructions", () => {
    test("#when reading the commit delegation example #then it no longer relies on category routing", async () => {
      const skillContent = await readProjectSkill("work-with-pr")

      const usesSubagentDelegation = skillContent.includes(
        'task(subagent_type="explore", prompt="Inspect the changes to commit and summarize atomic commit boundaries. Repository is at {WORKTREE_PATH}.")'
      )

      expect(usesSubagentDelegation).toBe(true)
      expect(skillContent).not.toContain('task(category="git"')
    })
  })

  describe("#given github-triage skill instructions", () => {
    test("#when reading task tracking examples #then they use the real task management tool names", async () => {
      const skillContent = await readProjectSkill("github-triage")

      const usesRealToolNames =
        skillContent.includes("task_create(subject=\"Triage: #{number} {title}\")")
        && skillContent.includes("task_update(id=task_id, status=\"completed\", description=REPORT_SUMMARY)")

      expect(usesRealToolNames).toBe(true)
      expect(skillContent).not.toContain("TaskCreate(")
      expect(skillContent).not.toContain("TaskUpdate(")
    })

    test("#when reading triage subagent examples #then they no longer rely on category routing", async () => {
      const skillContent = await readProjectSkill("github-triage")

      expect(skillContent).toContain('task(subagent_type="explore", run_in_background=true, prompt=SUBAGENT_PROMPT)')
      expect(skillContent).not.toContain('task(category="quick"')
      expect(skillContent).not.toContain('load_skills=[]')
    })
  })

  describe("#given pre-publish-review skill instructions", () => {
    test("#when reading task examples #then they no longer rely on category routing or load_skills", async () => {
      const skillContent = await readProjectSkill("pre-publish-review")

      expect(skillContent).toContain('task(\n  subagent_type="oracle"')
      expect(skillContent).not.toContain('category="ultrabrain"')
      expect(skillContent).not.toContain('category="unspecified-high"')
      expect(skillContent).not.toContain('load_skills=')
    })
  })

  describe("#given remove-deadcode command instructions", () => {
    test("#when reading lsp/task examples #then they use current tool names", async () => {
      const commandContent = await Bun.file(join(PROJECT_ROOT, ".opencode", "command", "remove-deadcode.md")).text()

      expect(commandContent).toContain('lsp_find_references(')
      expect(commandContent).not.toContain('LspFindReferences(')
      expect(commandContent).toContain('subagent_type="oracle"')
      expect(commandContent).not.toContain('category="deep"')
      expect(commandContent).not.toContain('load_skills=')
    })
  })
})
