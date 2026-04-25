import type { HookName, OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createToolOutputTruncatorHook,
  createWriteExistingFileGuardHook,
  createWebFetchRedirectGuardHook,
} from "../../hooks"

type ToolGuardHooks = {
  toolOutputTruncator: ReturnType<typeof createToolOutputTruncatorHook> | null
  writeExistingFileGuard: ReturnType<typeof createWriteExistingFileGuardHook> | null
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

  const webfetchRedirectGuard = isHookEnabled("webfetch-redirect-guard")
    ? createWebFetchRedirectGuardHook(ctx)
    : null

  return {
    toolOutputTruncator,
    writeExistingFileGuard,
    webfetchRedirectGuard,
  }
}
