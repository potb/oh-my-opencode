import type { BuiltinSkill } from "./types"
import type { BrowserAutomationProvider } from "../../config/schema"

import {
  agentBrowserSkill,
  frontendUiUxSkill,
  gitMasterSkill,
  reviewWorkSkill,
} from "./skills/index"

interface CreateBuiltinSkillsOptions {
  browserProvider?: BrowserAutomationProvider
  disabledSkills?: Set<string>
}

export function createBuiltinSkills(options: CreateBuiltinSkillsOptions = {}): BuiltinSkill[] {
  const { browserProvider: _browserProvider, disabledSkills } = options

  const skills = [agentBrowserSkill, frontendUiUxSkill, gitMasterSkill, reviewWorkSkill]

  if (!disabledSkills) {
    return skills
  }

  return skills.filter((skill) => !disabledSkills.has(skill.name))
}
