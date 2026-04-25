import { z } from "zod"
import { AgentOverridesSchema } from "./agent-overrides"
import { BackgroundTaskConfigSchema } from "./background-task"
import { BrowserAutomationConfigSchema } from "./browser-automation"
import { CategoriesConfigSchema } from "./categories"
import { ExperimentalConfigSchema } from "./experimental"
import { GitMasterConfigSchema } from "./git-master"
import { SisyphusConfigSchema } from "./sisyphus"
import { WebsearchConfigSchema } from "./websearch"

const LspEntrySchema = z.object({
  disabled: z.boolean().optional(),
  command: z.array(z.string()).optional(),
  extensions: z.array(z.string()).optional(),
  priority: z.number().optional(),
  env: z.record(z.string(), z.string()).optional(),
  initialization: z.record(z.string(), z.unknown()).optional(),
}).strict()

export const OhMyOpenCodeConfigSchema = z.object({
  $schema: z.string().optional(),
  plugin: z.array(z.string()).optional(),
  lsp: z.record(z.string(), LspEntrySchema).optional(),
  disabled_agents: z.array(z.string()).optional(),
  disabled_hooks: z.array(z.string()).optional(),
  /** Disable specific tools by name (e.g., ["todowrite", "todoread"]) */
  disabled_tools: z.array(z.string()).optional(),
  /** Enable hashline_edit tool/hook integrations (default: false) */
  hashline_edit: z.boolean().optional(),
  agents: AgentOverridesSchema.optional(),
  categories: CategoriesConfigSchema.optional(),
  experimental: ExperimentalConfigSchema.optional(),
  background_task: BackgroundTaskConfigSchema.optional(),
  git_master: GitMasterConfigSchema.default({
    commit_footer: true,
    include_co_authored_by: true,
    git_env_prefix: "GIT_MASTER=1",
  }),
  browser_automation_engine: BrowserAutomationConfigSchema.optional(),
  websearch: WebsearchConfigSchema.optional(),
  sisyphus: SisyphusConfigSchema.optional(),
}).strict()

export type OhMyOpenCodeConfig = z.infer<typeof OhMyOpenCodeConfigSchema>
