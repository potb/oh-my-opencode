import type { HookName, OhMyOpenCodeConfig } from "./config"
import type { BackgroundManager } from "./features/background-agent"
import type { PluginContext } from "./plugin/types"
import type { ModelCacheState } from "./plugin-state"

import { createCoreHooks } from "./plugin/hooks/create-core-hooks"
import { createContinuationHooks } from "./plugin/hooks/create-continuation-hooks"

export type CreatedHooks = ReturnType<typeof createHooks>

type DisposableHook = { dispose?: () => void } | null | undefined

type DisposableCreatedHooks = {
  commentChecker?: DisposableHook
  anthropicContextWindowLimitRecovery?: DisposableHook
}

export function disposeCreatedHooks(hooks: DisposableCreatedHooks): void {
  hooks.commentChecker?.dispose?.()
  hooks.anthropicContextWindowLimitRecovery?.dispose?.()
}

export function createHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  backgroundManager: BackgroundManager
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}) {
  const {
    ctx,
    pluginConfig,
    modelCacheState,
    backgroundManager,
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

  const continuation = createContinuationHooks({
    ctx,
    isHookEnabled,
    safeHookEnabled,
    backgroundManager,
  })

  const hooks = {
    ...core,
    ...continuation,
  }

  return {
    ...hooks,
    disposeHooks: (): void => {
      disposeCreatedHooks(hooks)
    },
  }
}
