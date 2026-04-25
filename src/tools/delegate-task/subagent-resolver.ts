import type { DelegateTaskArgs } from "./types"
import type { ExecutorContext } from "./executor-types"
import type { DelegatedModelConfig } from "./types"
import { isPlanFamily } from "./constants"
import { SISYPHUS_JUNIOR_AGENT } from "./sisyphus-junior-agent"
import { applyCategoryParams } from "./delegated-model-config"
import {
  type AgentInfo,
  sanitizeSubagentType,
  normalizeAvailableAgents,
  findPrimaryAgentMatch,
  findCallableAgentMatch,
  listCallableAgentNames,
} from "./subagent-discovery"
import { normalizeModelFormat } from "../../shared/model-format-normalizer"
import { normalizeModel } from "../../shared/model-normalization"
import { getAgentConfigKey, stripAgentListSortPrefix } from "../../shared/agent-display-names"
import { normalizeSDKResponse } from "../../shared"
import { log } from "../../shared/logger"
import { getAvailableModelsForDelegateTask } from "./available-models"
import { resolveModelForDelegateTask } from "./model-selection"
import { fuzzyMatchModel } from "../../shared/model-availability"

function normalizeConfiguredModel(model: string | undefined): DelegatedModelConfig | undefined {
  const normalized = normalizeModel(model)
  if (!normalized) return undefined
  const parts = normalized.split("/")
  if (parts.length < 2) return undefined
  return { providerID: parts[0], modelID: parts.slice(1).join("/") }
}

export async function resolveSubagentExecution(
  args: DelegateTaskArgs,
  executorCtx: ExecutorContext,
  parentAgent: string | undefined,
  _categoryExamples: string
): Promise<{ agentToUse: string; categoryModel: DelegatedModelConfig | undefined; error?: string }> {
  const { client, agentOverrides, userCategories } = executorCtx

  if (!args.subagent_type?.trim()) {
    return { agentToUse: "", categoryModel: undefined, error: `Agent name cannot be empty.` }
  }

  const agentName = sanitizeSubagentType(args.subagent_type)

  if (agentName.toLowerCase() === SISYPHUS_JUNIOR_AGENT.toLowerCase()) {
    return {
      agentToUse: "",
      categoryModel: undefined,
        error: `Cannot use subagent_type="${SISYPHUS_JUNIOR_AGENT}" directly. Choose a supported callable subagent instead.

Sisyphus-Junior is internal to the fixed-product runtime and is not directly callable via task.`,
    }
  }

  if (isPlanFamily(agentName) && isPlanFamily(parentAgent)) {
    return {
      agentToUse: "",
      categoryModel: undefined,
    error: `You are a plan-family agent (plan). You cannot delegate to other plan-family agents via task.

Create the work plan directly - that's your job as the planning agent.`,
    }
  }

  let agentToUse = agentName
  let categoryModel: DelegatedModelConfig | undefined

  try {
    const agentsResult = await client.app.agents()
    const agents = normalizeSDKResponse<AgentInfo[]>(agentsResult)

    const mergedAgents = normalizeAvailableAgents(agents)
    const matchedPrimaryAgent = findPrimaryAgentMatch(mergedAgents, agentToUse)

    if (matchedPrimaryAgent) {
      return {
        agentToUse: "",
        categoryModel: undefined,
        error: `Cannot delegate to primary agent "${stripAgentListSortPrefix(matchedPrimaryAgent.name)}" via task. Select that agent directly instead.`,
      }
    }

    const matchedAgent = findCallableAgentMatch(mergedAgents, agentToUse)
    if (!matchedAgent) {
      return {
        agentToUse: "",
        categoryModel: undefined,
        error: `Unknown agent: "${agentToUse}". Available agents: ${listCallableAgentNames(mergedAgents)}`,
      }
    }

    agentToUse = stripAgentListSortPrefix(matchedAgent.name)

    const agentConfigKey = getAgentConfigKey(agentToUse)
    const agentOverride = agentOverrides?.[agentConfigKey as keyof typeof agentOverrides]
      ?? (agentOverrides ? Object.entries(agentOverrides).find(([key]) => key.toLowerCase() === agentConfigKey)?.[1] : undefined)
    const agentCategoryConfig = agentOverride?.category
      ? userCategories?.[agentOverride.category]
      : undefined
    const agentCategoryModel = agentCategoryConfig?.model
    const availableModels = await getAvailableModelsForDelegateTask(client)

    if (agentCategoryModel || matchedAgent.model) {

      const normalizedMatchedModel = matchedAgent.model
        ? normalizeModelFormat(matchedAgent.model)
        : undefined
      const matchedAgentModelStr = normalizedMatchedModel
        ? `${normalizedMatchedModel.providerID}/${normalizedMatchedModel.modelID}`
        : undefined

      const resolution = resolveModelForDelegateTask({
        userModel: agentCategoryModel,
        categoryDefaultModel: matchedAgentModelStr,
        availableModels,
      })

      if (resolution && !('skipped' in resolution)) {
        const normalized = normalizeConfiguredModel(resolution.model)
        if (normalized) {
          const variantToUse = agentOverride?.variant ?? resolution.variant ?? agentCategoryConfig?.variant
          const resolvedModel = variantToUse ? { ...normalized, variant: variantToUse } : normalized
          categoryModel = applyCategoryParams(resolvedModel, agentCategoryConfig)
        }
      }

    }

    if (!categoryModel && matchedAgent.model) {
      const normalizedMatchedModel = normalizeModelFormat(matchedAgent.model)
      if (normalizedMatchedModel) {
        const fullModel = `${normalizedMatchedModel.providerID}/${normalizedMatchedModel.modelID}`
        if (fuzzyMatchModel(fullModel, availableModels, [normalizedMatchedModel.providerID])) {
          categoryModel = normalizedMatchedModel
        } else {
          log("[delegate-task] Skipping unavailable agent default model", {
            agent: agentToUse,
            model: fullModel,
          })
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log("[delegate-task] Failed to resolve subagent execution", {
      requestedAgent: agentToUse,
      parentAgent,
      error: errorMessage,
    })

    return {
      agentToUse: "",
      categoryModel: undefined,
      error: `Failed to delegate to agent "${agentToUse}": ${errorMessage}`,
    }
  }

  return { agentToUse, categoryModel }
}
