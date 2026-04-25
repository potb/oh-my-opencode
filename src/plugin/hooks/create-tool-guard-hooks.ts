import type { HookName, OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createToolOutputTruncatorHook,
  createWriteExistingFileGuardHook,
  createHashlineReadEnhancerHook,
  createWebFetchRedirectGuardHook,
} from "../../hooks"

type ToolGuardHooks = {
  toolOutputTruncator: ReturnType<typeof createToolOutputTruncatorHook> | null
  writeExistingFileGuard: ReturnType<typeof createWriteExistingFileGuardHook> | null
  hashlineReadEnhancer: ReturnType<typeof createHashlineReadEnhancerHook> | null
  webfetchRedirectGuard: ReturnType<typeof createWebFetchRedirectGuardHook> | null
}

export function createToolGuardHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
}): ToolGuardHooks {
  const { ctx, pluginConfig, modelCacheState, isHookEnabled } = args

  const toolOutputTruncator = isHookEnabled("tool-output-truncator")
    ? createToolOutputTruncatorHook(ctx, {
        modelCacheState,
        experimental: pluginConfig.experimental,
      })
    : null

  const writeExistingFileGuard = isHookEnabled("write-existing-file-guard")
    ? createWriteExistingFileGuardHook(ctx)
    : null

  const hashlineReadEnhancer = isHookEnabled("hashline-read-enhancer")
    ? createHashlineReadEnhancerHook(ctx, { hashline_edit: { enabled: pluginConfig.hashline_edit ?? false } })
    : null

  const webfetchRedirectGuard = isHookEnabled("webfetch-redirect-guard")
    ? createWebFetchRedirectGuardHook(ctx)
    : null

  return {
    toolOutputTruncator,
    writeExistingFileGuard,
    hashlineReadEnhancer,
    webfetchRedirectGuard,
  }
}
