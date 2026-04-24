import type { HookName, OhMyOpenCodeConfig } from "./config"
import type { PluginContext } from "./plugin/types"
import type { ModelCacheState } from "./plugin-state"

import { createCoreHooks } from "./plugin/hooks/create-core-hooks"

export type CreatedHooks = ReturnType<typeof createHooks>

export function disposeCreatedHooks(): void {}

export function createHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}) {
  const {
    ctx,
    pluginConfig,
    modelCacheState,
    isHookEnabled,
    safeHookEnabled,
  } = args

  const core = createCoreHooks({
    ctx,
    pluginConfig,
    modelCacheState,
    isHookEnabled,
    safeHookEnabled,
  })

  const hooks = core

  return {
    ...hooks,
    disposeHooks: (): void => {
      disposeCreatedHooks()
    },
  }
}
