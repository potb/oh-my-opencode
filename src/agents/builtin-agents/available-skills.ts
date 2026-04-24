import type { AvailableSkill } from "../dynamic-agent-prompt-builder"
import type { BrowserAutomationProvider } from "../../config/schema"
import { createBuiltinSkills } from "../../features/builtin-skills"

export function buildAvailableSkills(
  _discoveredSkills: unknown[] = [],
  browserProvider?: BrowserAutomationProvider,
  disabledSkills?: Set<string>
): AvailableSkill[] {
  const builtinSkills = createBuiltinSkills({ browserProvider, disabledSkills })

  return builtinSkills.map((skill) => ({
    name: skill.name,
    description: skill.description,
    location: "plugin" as const,
  }))
}
