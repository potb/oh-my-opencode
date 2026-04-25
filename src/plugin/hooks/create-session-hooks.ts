import type { OhMyOpenCodeConfig, HookName } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createNonInteractiveEnvHook,
  createSisyphusJuniorNotepadHook,
  createQuestionLabelTruncatorHook,
} from "../../hooks"
import { createAnthropicEffortHook } from "../../hooks/anthropic-effort"

type SessionHooks = {
  nonInteractiveEnv: ReturnType<typeof createNonInteractiveEnvHook> | null
  sisyphusJuniorNotepad: ReturnType<typeof createSisyphusJuniorNotepadHook> | null
  questionLabelTruncator: ReturnType<typeof createQuestionLabelTruncatorHook> | null
  anthropicEffort: ReturnType<typeof createAnthropicEffortHook> | null
}

export function createSessionHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
}): SessionHooks {
  const { ctx, isHookEnabled } = args

  const nonInteractiveEnv = isHookEnabled("non-interactive-env")
    ? createNonInteractiveEnvHook(ctx)
    : null

  const sisyphusJuniorNotepad = isHookEnabled("sisyphus-junior-notepad")
    ? createSisyphusJuniorNotepadHook(ctx)
    : null

  const questionLabelTruncator = isHookEnabled("question-label-truncator")
    ? createQuestionLabelTruncatorHook()
    : null

  const anthropicEffort = isHookEnabled("anthropic-effort")
    ? createAnthropicEffortHook()
    : null

  return {
    nonInteractiveEnv,
    sisyphusJuniorNotepad,
    questionLabelTruncator,
    anthropicEffort,
  }
}
