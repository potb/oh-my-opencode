import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "sisyphus",
  "oracle",
  "librarian",
  "explore",
  "metis",
  "momus",
  "atlas",
  "sisyphus-junior",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend-ui-ux",
  "git-master",
  "review-work",
  "ai-slop-remover",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "sisyphus",
  "sisyphus-junior",
  "OpenCode-Builder",
  "metis",
  "momus",
  "oracle",
  "librarian",
  "explore",
  "atlas",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
