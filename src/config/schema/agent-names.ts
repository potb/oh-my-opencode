import { z } from "zod"

const BuiltinAgentNameSchema = z.enum([
  "sisyphus",
  "oracle",
  "librarian",
  "explore",
  "metis",
  "momus",
  "sisyphus-junior",
])

const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend-ui-ux",
  "git-master",
  "review-work",
  "ai-slop-remover",
])

const OverridableAgentNameSchema = z.enum([
  "plan",
  "sisyphus",
  "sisyphus-junior",
  "metis",
  "momus",
  "oracle",
  "librarian",
  "explore",
])

const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
