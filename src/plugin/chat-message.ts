import type { OhMyOpenCodeConfig } from "../config"
import type { PluginContext } from "./types"

import { isModelCacheAvailable, log } from "../shared"
import { getAgentConfigKey } from "../shared/agent-display-names"
import { getSessionModel, setSessionModel } from "../shared/session-model-state"
import { getMainSessionID, setSessionAgent, subagentSessions } from "../features/claude-code-session-state"
import { applyUltraworkModelOverrideOnMessage } from "./ultrawork-model-override"

import type { CreatedHooks } from "../create-hooks"

type FirstMessageVariantGate = {
  shouldOverride: (sessionID: string) => boolean
  markApplied: (sessionID: string) => void
}

type ChatMessagePart = { type: string; text?: string; [key: string]: unknown }
export type ChatMessageHandlerOutput = { message: Record<string, unknown>; parts: ChatMessagePart[] }
export type ChatMessageInput = {
  sessionID: string
  agent?: string
  model?: { providerID: string; modelID: string }
}

type SessionModelOverride = { providerID: string; modelID: string }

function hasExplicitAgentModelOverride(
  agent: string | undefined,
  pluginConfig: OhMyOpenCodeConfig
): boolean {
  const configuredAgents = pluginConfig.agents
  const normalizedAgent = typeof agent === "string" ? getAgentConfigKey(agent) : undefined
  if (!normalizedAgent || !configuredAgents || !(normalizedAgent in configuredAgents)) {
    return false
  }

  const configuredAgent = configuredAgents[normalizedAgent as keyof typeof configuredAgents]
  const configuredModel = configuredAgent?.model
  return typeof configuredModel === "string" && configuredModel.trim().length > 0
}

function getStoredMainSessionModel(
  input: ChatMessageInput,
  pluginConfig: OhMyOpenCodeConfig,
  isFirstMessage: boolean,
  output: ChatMessageHandlerOutput
): SessionModelOverride | undefined {
  if (isFirstMessage) {
    return undefined
  }

  if (subagentSessions.has(input.sessionID)) {
    return undefined
  }

  if (getMainSessionID() !== input.sessionID) {
    return undefined
  }

  if (input.model) {
    return undefined
  }

  if (output.message["model"] !== undefined) {
    return undefined
  }

  if (hasExplicitAgentModelOverride(input.agent, pluginConfig)) {
    return undefined
  }

  return getSessionModel(input.sessionID)
}

export function createChatMessageHandler(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  firstMessageVariantGate: FirstMessageVariantGate
  hooks: CreatedHooks
}): (
  input: ChatMessageInput,
  output: ChatMessageHandlerOutput
) => Promise<void> {
  const { ctx, pluginConfig, firstMessageVariantGate, hooks } = args
  const pluginContext = ctx as {
    client: {
      tui: {
        showToast: (input: {
          body: {
            title: string
            message: string
            variant: "warning"
            duration: number
          }
        }) => Promise<unknown>
      }
    }
  }
  return async (
    input: ChatMessageInput,
    output: ChatMessageHandlerOutput
  ): Promise<void> => {
    if (input.agent) {
      setSessionAgent(input.sessionID, input.agent)
    }

    const isFirstMessage = firstMessageVariantGate.shouldOverride(input.sessionID)
    if (isFirstMessage) {
      firstMessageVariantGate.markApplied(input.sessionID)
    }

    const storedMainSessionModel = getStoredMainSessionModel(
      input,
      pluginConfig,
      isFirstMessage,
      output,
    )
    if (storedMainSessionModel) {
      output.message["model"] = storedMainSessionModel
    }

    const modelOverride = output.message["model"]
    if (
      modelOverride &&
      typeof modelOverride === "object" &&
      "providerID" in modelOverride &&
      "modelID" in modelOverride
    ) {
      const providerID = (modelOverride as { providerID?: string }).providerID
      const modelID = (modelOverride as { modelID?: string }).modelID
      if (typeof providerID === "string" && typeof modelID === "string") {
        setSessionModel(input.sessionID, { providerID, modelID })
      }
    } else if (input.model) {
      setSessionModel(input.sessionID, input.model)
    }
    await hooks.keywordDetector?.["chat.message"]?.(input, output)
    await hooks.thinkMode?.["chat.message"]?.(input, output)
    await hooks.claudeCodeHooks?.["chat.message"]?.(input, output)
    await hooks.noSisyphusGpt?.["chat.message"]?.(input, output)

    if (!isModelCacheAvailable()) {
      pluginContext.client.tui
        .showToast({
          body: {
            title: "⚠️ Provider Cache Missing",
            message:
              "Model filtering disabled. RESTART OpenCode to enable full functionality.",
            variant: "warning" as const,
            duration: 6000,
          },
        })
        .catch(() => {})
    }

    await applyUltraworkModelOverrideOnMessage(
      pluginConfig,
      input.agent,
      output,
      pluginContext.client.tui,
      input.sessionID,
      pluginContext.client,
    )
  }
}
