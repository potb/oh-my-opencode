import { tool, type ToolDefinition } from "@opencode-ai/plugin"
import type { DelegateTaskArgs, DelegatedModelConfig, ToolContextWithMetadata, DelegateTaskToolOptions } from "./types"
import { log } from "../../shared/logger"
import { buildSystemContent } from "./prompt-builder"
import type {
  AvailableCategory,
  AvailableSkill,
} from "../../agents/dynamic-agent-prompt-builder"
import {
  resolveParentContext,
  executeBackgroundContinuation,
  executeSyncContinuation,
  resolveSubagentExecution,
  executeBackgroundTask,
  executeSyncTask,
} from "./executor"

export type { SyncSessionCreatedEvent, DelegateTaskToolOptions, BuildSystemContentInput } from "./types"
export { buildSystemContent, buildTaskPrompt } from "./prompt-builder"

export function createDelegateTask(options: DelegateTaskToolOptions): ToolDefinition {
  const availableCategories: AvailableCategory[] = options.availableCategories ?? []
  const availableSkills: AvailableSkill[] = options.availableSkills ?? []
  const description = `Spawn a delegated subagent task.

  REQUIRED for new tasks:
  - subagent_type: Direct target agent name (for example: explore, librarian, oracle, metis, momus)
  - prompt: Full detailed prompt for the agent
  - run_in_background: true=async (returns task metadata), false=sync (waits for result)

  Continuation:
  - session_id: Continue an existing task session with its prior context preserved

  Notes:
  - Category-based task routing has been removed from the fixed-product runtime.
  - Skill loading through task has been removed from the fixed-product runtime.
  - Prompts must be in English.`

  return tool({
    description,
    args: {
      description: tool.schema.string().optional().describe("Short task description (3-5 words). Auto-generated from prompt if omitted."),
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      run_in_background: tool.schema.boolean().describe("REQUIRED. true=async (returns task metadata), false=sync (waits for result)."),
      subagent_type: tool.schema.string().optional().describe("REQUIRED for new tasks. Direct target agent name."),
      session_id: tool.schema.string().optional().describe("Existing Task session to continue"),
      command: tool.schema.string().optional().describe("The command that triggered this task"),
    },
    async execute(args: DelegateTaskArgs, toolContext) {
      const ctx = toolContext as ToolContextWithMetadata

      // Auto-generate description from prompt when missing or empty
      if (!args.description || typeof args.description !== "string" || args.description.trim() === "") {
        const words = (args.prompt || "").trim().split(/\s+/)
        args.description = words.slice(0, 4).join(" ") || "Delegated task"
      }
      await ctx.metadata?.({
        title: args.description,
      })
      if (args.run_in_background === undefined) {
        throw new Error(`Invalid arguments: 'run_in_background' parameter is REQUIRED. Specify run_in_background=false for task delegation, or run_in_background=true for parallel exploration.`)
      }

      const runInBackground = args.run_in_background === true

      if (args.category) {
        return `Invalid arguments: category-based task routing has been removed. Provide subagent_type instead.`
      }

      const parentContext = await resolveParentContext(ctx, options.client)

      if (args.session_id) {
        if (runInBackground) {
          return executeBackgroundContinuation(args, ctx, options, parentContext)
        }
        return executeSyncContinuation(args, ctx, options)
      }

      if (!args.subagent_type) {
        return `Invalid arguments: Must provide subagent_type for new tasks.`
      }

      let systemDefaultModel: string | undefined
      try {
        const openCodeConfig = await options.client.config.get()
        systemDefaultModel = (openCodeConfig as { data?: { model?: string } })?.data?.model
      } catch {
        systemDefaultModel = undefined
      }

      const inheritedModel = parentContext.model
        ? `${parentContext.model.providerID}/${parentContext.model.modelID}`
        : undefined

      let agentToUse: string
      let categoryModel: DelegatedModelConfig | undefined
      let modelInfo: import("../../features/task-toast-manager/types").ModelFallbackInfo | undefined
      let fallbackChain: import("../../shared/model-requirements").FallbackEntry[] | undefined
      let maxPromptTokens: number | undefined

      const resolution = await resolveSubagentExecution(args, options, parentContext.agent, "explore, librarian, oracle, metis, momus")
      if (resolution.error) {
        return resolution.error
      }
      agentToUse = resolution.agentToUse
      categoryModel = resolution.categoryModel
      fallbackChain = resolution.fallbackChain

      const systemContent = buildSystemContent({
        agentName: agentToUse,
        maxPromptTokens,
        model: categoryModel,
        availableCategories,
        availableSkills,
      })

      if (runInBackground) {
        return executeBackgroundTask(args, ctx, options, parentContext, agentToUse, categoryModel, systemContent, fallbackChain)
      }

      return executeSyncTask(args, ctx, options, parentContext, agentToUse, categoryModel, systemContent, modelInfo, fallbackChain)
    },
  })
}
