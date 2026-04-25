import { z } from "zod"
import { DynamicContextPruningConfigSchema } from "./dynamic-context-pruning"

export const ExperimentalConfigSchema = z.object({
  truncate_all_tool_outputs: z.boolean().optional(),
  /** Dynamic context pruning configuration */
  dynamic_context_pruning: DynamicContextPruningConfigSchema.optional(),
  /** Disable auto-injected <omo-env> context in prompts (experimental) */
  disable_omo_env: z.boolean().optional(),
  /** Enable hashline_edit tool for improved file editing with hash-based line anchors */
  hashline_edit: z.boolean().optional(),
  /** Maximum number of tools to register. When set, lower-priority tools are excluded to stay within provider limits (e.g., OpenAI's 128-tool cap). Accounts for ~20 OpenCode built-in tools. */
  max_tools: z.number().int().min(1).optional(),
}).strict()

export type ExperimentalConfig = z.infer<typeof ExperimentalConfigSchema>
