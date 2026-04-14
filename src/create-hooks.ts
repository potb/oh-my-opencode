import type { HookName, OhMyOpenCodeConfig } from "./config"
import type { BackgroundManager } from "./features/background-agent"
import type { PluginContext } from "./plugin/types"
import type { ModelCacheState } from "./plugin-state"

import { createCoreHooks } from "./plugin/hooks/create-core-hooks"
import { createContinuationHooks } from "./plugin/hooks/create-continuation-hooks"

export type CreatedHooks = ReturnType<typeof createHooks>

type DisposableHook = { dispose?: () => void } | null | undefined

export type DisposableCreatedHooks = {
  claudeCodeHooks?: DisposableHook
  commentChecker?: DisposableHook
  todoContinuationEnforcer?: DisposableHook
  anthropicContextWindowLimitRecovery?: DisposableHook
}

export function disposeCreatedHooks(hooks: DisposableCreatedHooks): void {
  hooks.claudeCodeHooks?.dispose?.()
  hooks.commentChecker?.dispose?.()
  hooks.todoContinuationEnforcer?.dispose?.()
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
    pluginConfig,
    isHookEnabled,
    safeHookEnabled,
    backgroundManager,
    sessionRecovery: core.sessionRecovery,
  })

  const hooks = {
    ...core,
    ...continuation,
    autoSlashCommand: null,
    categorySkillReminder: null,
  }

  return {
    ...hooks,
    disposeHooks: (): void => {
      disposeCreatedHooks(hooks)
    },
  }
}
