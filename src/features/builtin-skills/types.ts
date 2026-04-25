export interface SkillMcpServerConfig {
  type: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
}

export type SkillMcpConfig = Record<string, SkillMcpServerConfig>

export interface BuiltinSkill {
  name: string
  description: string
  template: string
  license?: string
  metadata?: Record<string, unknown>
  allowedTools?: string[]
  agent?: string
  model?: string
  subtask?: boolean
  argumentHint?: string
  mcpConfig?: SkillMcpConfig
}
