import type {
  AvailableCategory,
  AvailableSkill,
} from "./dynamic-agent-prompt-types"

function buildSkillsSection(skills: AvailableSkill[]): string {
  const builtinSkills = skills.filter((skill) => skill.location === "plugin")
  const customSkills = skills.filter((skill) => skill.location !== "plugin")

  const builtinNames = builtinSkills.map((skill) => skill.name).join(", ")
  const customNames = customSkills
    .map((skill) => {
      const source = skill.location === "project" ? "project" : "user"
      return `${skill.name} (${source})`
    })
    .join(", ")

  if (customSkills.length > 0 && builtinSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}
**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  if (customSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  if (builtinSkills.length > 0) {
    return `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}

> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  }

  return ""
}

export function buildCategorySkillsDelegationGuide(
  categories: AvailableCategory[],
  skills: AvailableSkill[],
): string {
  if (categories.length === 0 && skills.length === 0) {
    return ""
  }
  void categories
  void skills

  return `### Delegation Constraints

- Category-based task routing has been removed from the fixed-product runtime.
- Skill loading through the \`task\` tool has been removed from the fixed-product runtime.
- Use direct \`subagent_type\` delegation with \`task(subagent_type="...", run_in_background=..., ...)\`.
- If no suitable subagent exists, work directly with the available local tools instead of inventing category or skill routing.`
}
