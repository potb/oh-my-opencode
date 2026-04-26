import type { Plugin } from "@opencode-ai/plugin"

import type { HookName } from "./config"

import { createHooks } from "./create-hooks"
import { createManagers } from "./create-managers"
import { createTools } from "./create-tools"
import { createPluginInterface } from "./plugin-interface"
import { createPluginDispose, type PluginDispose } from "./plugin-dispose"

import { PLUGIN_CONFIG } from "./plugin-config"
import { createModelCacheState } from "./plugin-state"
import { createFirstMessageVariantGate } from "./shared/first-message-variant"
import { initConfigContext, injectServerAuthIntoClient, log } from "./shared"
import { lspManager } from "./tools/lsp/client"

let activePluginDispose: PluginDispose | null = null

const OhMyOpenCodePlugin: Plugin = async (ctx) => {
  initConfigContext("opencode", null)
  log("[OhMyOpenCodePlugin] ENTRY - plugin loading", {
    directory: ctx.directory,
  })

  injectServerAuthIntoClient(ctx.client)
  await activePluginDispose?.()

  const pluginConfig = PLUGIN_CONFIG
  const disabledHooks = new Set(pluginConfig.disabled_hooks)

  const isHookEnabled = (hookName: HookName): boolean => !disabledHooks.has(hookName)
  const firstMessageVariantGate = createFirstMessageVariantGate()

  const modelCacheState = createModelCacheState()

  const managers = createManagers({
    ctx,
    pluginConfig,
    modelCacheState,
  })

  const toolsResult = await createTools({
    ctx,
    pluginConfig,
    managers,
  })

  const hooks = createHooks({
    ctx,
    pluginConfig,
    modelCacheState,
    isHookEnabled,
  })

  const dispose = createPluginDispose({
    backgroundManager: managers.backgroundManager,
    lspManager,
    disposeHooks: hooks.disposeHooks,
  })

  const pluginInterface = createPluginInterface({
    ctx,
    pluginConfig,
    firstMessageVariantGate,
    managers,
    hooks,
    tools: toolsResult.filteredTools,
  })

  activePluginDispose = dispose

  return {
    name: "oh-my-opencode",
    ...pluginInterface,

    "experimental.session.compacting": async (
      _input: { sessionID: string },
      output: { context: string[] },
    ): Promise<void> => {
      void _input
      void output
    },
  }
}

export default OhMyOpenCodePlugin

export type {
  OhMyOpenCodeConfig,
  AgentName,
  AgentOverrideConfig,
  AgentOverrides,
  HookName,
} from "./config"
