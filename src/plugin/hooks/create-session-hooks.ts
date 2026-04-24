import type { OhMyOpenCodeConfig, HookName } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createNonInteractiveEnvHook,
  createEditErrorRecoveryHook,
  createDelegateTaskRetryHook,
  createSisyphusJuniorNotepadHook,
  createQuestionLabelTruncatorHook,
} from "../../hooks"
import { createAnthropicEffortHook } from "../../hooks/anthropic-effort"
import { safeCreateHook } from "../../shared/safe-create-hook"

type SessionHooks = {
  nonInteractiveEnv: ReturnType<typeof createNonInteractiveEnvHook> | null
  editErrorRecovery: ReturnType<typeof createEditErrorRecoveryHook> | null
  delegateTaskRetry: ReturnType<typeof createDelegateTaskRetryHook> | null
  sisyphusJuniorNotepad: ReturnType<typeof createSisyphusJuniorNotepadHook> | null
  questionLabelTruncator: ReturnType<typeof createQuestionLabelTruncatorHook> | null
  anthropicEffort: ReturnType<typeof createAnthropicEffortHook> | null
}

export function createSessionHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}): SessionHooks {
  const { ctx, isHookEnabled, safeHookEnabled } = args
  const safeHook = <T>(hookName: HookName, factory: () => T): T | null =>
    safeCreateHook(hookName, factory, { enabled: safeHookEnabled })

  const nonInteractiveEnv = isHookEnabled("non-interactive-env")
    ? safeHook("non-interactive-env", () => createNonInteractiveEnvHook(ctx))
    : null

  const editErrorRecovery = isHookEnabled("edit-error-recovery")
    ? safeHook("edit-error-recovery", () => createEditErrorRecoveryHook(ctx))
    : null

  const delegateTaskRetry = isHookEnabled("delegate-task-retry")
    ? safeHook("delegate-task-retry", () => createDelegateTaskRetryHook(ctx))
    : null

  const sisyphusJuniorNotepad = isHookEnabled("sisyphus-junior-notepad")
    ? safeHook("sisyphus-junior-notepad", () => createSisyphusJuniorNotepadHook(ctx))
    : null

  const questionLabelTruncator = isHookEnabled("question-label-truncator")
    ? safeHook("question-label-truncator", () => createQuestionLabelTruncatorHook())
    : null

  const anthropicEffort = isHookEnabled("anthropic-effort")
    ? safeHook("anthropic-effort", () => createAnthropicEffortHook())
    : null

  return {
    nonInteractiveEnv,
    editErrorRecovery,
    delegateTaskRetry,
    sisyphusJuniorNotepad,
    questionLabelTruncator,
    anthropicEffort,
  }
}
