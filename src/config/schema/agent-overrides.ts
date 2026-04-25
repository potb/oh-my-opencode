import { z } from "zod"
import { AgentPermissionSchema } from "./internal/permission"

const AgentOverrideConfigSchema = z.object({
  variant: z.string().optional(),
  /** Category name to inherit model and other settings from CategoryConfig */
  category: z.string().optional(),
  /** Skill names to inject into agent prompt */
  skills: z.array(z.string()).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  prompt: z.string().optional(),
  /** Text to append to agent prompt. Supports file:// URIs (file:///abs, file://./rel, file://~/home) */
  prompt_append: z.string().optional(),
  disable: z.boolean().optional(),
  description: z.string().optional(),
  mode: z.enum(["subagent", "primary", "all"]).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  permission: AgentPermissionSchema.optional(),
  /** Maximum tokens for response. Passed directly to OpenCode SDK. */
  maxTokens: z.number().optional(),
  /** Extended thinking configuration (Anthropic). Overrides category and default settings. */
  thinking: z
    .object({
      type: z.enum(["enabled", "disabled"]),
      budgetTokens: z.number().optional(),
    })
    .strict()
    .optional(),
  /** Reasoning effort level (OpenAI). Overrides category and default settings. */
  reasoningEffort: z.enum(["none", "minimal", "low", "medium", "high", "xhigh"]).optional(),
  /** Text verbosity level. */
  textVerbosity: z.enum(["low", "medium", "high"]).optional(),
  /** Provider-specific options. Passed directly to OpenCode SDK. */
  providerOptions: z.record(z.string(), z.unknown()).optional(),
  /** Per-message ultrawork override model/variant when ultrawork keyword is detected. */
  ultrawork: z
    .object({
      model: z.string().optional(),
      variant: z.string().optional(),
    })
    .strict()
    .optional(),
  compaction: z
    .object({
      model: z.string().optional(),
      variant: z.string().optional(),
    })
    .strict()
    .optional(),
}).strict()

export const AgentOverridesSchema = z.object({
  plan: AgentOverrideConfigSchema.optional(),
  sisyphus: AgentOverrideConfigSchema.optional(),
  "sisyphus-junior": AgentOverrideConfigSchema.optional(),
  metis: AgentOverrideConfigSchema.optional(),
  momus: AgentOverrideConfigSchema.optional(),
  oracle: AgentOverrideConfigSchema.optional(),
  librarian: AgentOverrideConfigSchema.optional(),
  explore: AgentOverrideConfigSchema.optional(),
}).strict()

export type AgentOverrideConfig = z.infer<typeof AgentOverrideConfigSchema>
export type AgentOverrides = z.infer<typeof AgentOverridesSchema>
