import type { OhMyOpenCodeConfig, HookName } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createContextWindowMonitorHook,
  createSessionRecoveryHook,
  createSessionNotification,
  createThinkModeHook,
  createAnthropicContextWindowLimitRecoveryHook,
  createAutoUpdateCheckerHook,
  createAgentUsageReminderHook,
  createNonInteractiveEnvHook,
  createEditErrorRecoveryHook,
  createDelegateTaskRetryHook,
  createTaskResumeInfoHook,
  createSisyphusJuniorNotepadHook,
  createQuestionLabelTruncatorHook,
  createPreemptiveCompactionHook,
  createLegacyPluginToastHook,
} from "../../hooks"
import { createAnthropicEffortHook } from "../../hooks/anthropic-effort"
import {
  detectExternalNotificationPlugin,
  getNotificationConflictWarning,
  log,
} from "../../shared"
import { safeCreateHook } from "../../shared/safe-create-hook"

type SessionHooks = {
  contextWindowMonitor: ReturnType<typeof createContextWindowMonitorHook> | null
  preemptiveCompaction: ReturnType<typeof createPreemptiveCompactionHook> | null
  sessionRecovery: ReturnType<typeof createSessionRecoveryHook> | null
  sessionNotification: ReturnType<typeof createSessionNotification> | null
  thinkMode: ReturnType<typeof createThinkModeHook> | null
  anthropicContextWindowLimitRecovery: ReturnType<typeof createAnthropicContextWindowLimitRecoveryHook> | null
  autoUpdateChecker: ReturnType<typeof createAutoUpdateCheckerHook> | null
  agentUsageReminder: ReturnType<typeof createAgentUsageReminderHook> | null
  nonInteractiveEnv: ReturnType<typeof createNonInteractiveEnvHook> | null
  editErrorRecovery: ReturnType<typeof createEditErrorRecoveryHook> | null
  delegateTaskRetry: ReturnType<typeof createDelegateTaskRetryHook> | null
  sisyphusJuniorNotepad: ReturnType<typeof createSisyphusJuniorNotepadHook> | null
  questionLabelTruncator: ReturnType<typeof createQuestionLabelTruncatorHook> | null
  taskResumeInfo: ReturnType<typeof createTaskResumeInfoHook> | null
  anthropicEffort: ReturnType<typeof createAnthropicEffortHook> | null
  legacyPluginToast: ReturnType<typeof createLegacyPluginToastHook> | null
}

export function createSessionHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}): SessionHooks {
  const { ctx, pluginConfig, modelCacheState, isHookEnabled, safeHookEnabled } = args
  const safeHook = <T>(hookName: HookName, factory: () => T): T | null =>
    safeCreateHook(hookName, factory, { enabled: safeHookEnabled })

  const contextWindowMonitor = isHookEnabled("context-window-monitor")
    ? safeHook("context-window-monitor", () =>
        createContextWindowMonitorHook(ctx, modelCacheState))
    : null

  const preemptiveCompaction =
    isHookEnabled("preemptive-compaction") &&
    pluginConfig.experimental?.preemptive_compaction
      ? safeHook("preemptive-compaction", () =>
          createPreemptiveCompactionHook(ctx, pluginConfig, modelCacheState))
      : null

  const sessionRecovery = isHookEnabled("session-recovery")
    ? safeHook("session-recovery", () =>
        createSessionRecoveryHook(ctx, { experimental: pluginConfig.experimental }))
    : null

  let sessionNotification: ReturnType<typeof createSessionNotification> | null = null
  if (isHookEnabled("session-notification")) {
    const externalNotifier = detectExternalNotificationPlugin(ctx.directory)
    if (externalNotifier.detected) {
      log(getNotificationConflictWarning(externalNotifier.pluginName!))
    } else {
      sessionNotification = safeHook("session-notification", () => createSessionNotification(ctx))
    }
  }

  const thinkMode = isHookEnabled("think-mode")
    ? safeHook("think-mode", () => createThinkModeHook())
    : null

  const anthropicContextWindowLimitRecovery = isHookEnabled("anthropic-context-window-limit-recovery")
    ? safeHook("anthropic-context-window-limit-recovery", () =>
        createAnthropicContextWindowLimitRecoveryHook(ctx, { experimental: pluginConfig.experimental, pluginConfig }))
    : null

  const autoUpdateChecker = isHookEnabled("auto-update-checker")
    ? safeHook("auto-update-checker", () =>
        createAutoUpdateCheckerHook(ctx, {
          showStartupToast: true,
          isSisyphusEnabled: true,
          autoUpdate: false,
          modelCapabilities: undefined,
        }))
    : null

  const agentUsageReminder = isHookEnabled("agent-usage-reminder")
    ? safeHook("agent-usage-reminder", () => createAgentUsageReminderHook(ctx))
    : null

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
  const taskResumeInfo = isHookEnabled("task-resume-info")
    ? safeHook("task-resume-info", () => createTaskResumeInfoHook())
    : null

  const anthropicEffort = isHookEnabled("anthropic-effort")
    ? safeHook("anthropic-effort", () => createAnthropicEffortHook())
    : null

  const legacyPluginToast = isHookEnabled("legacy-plugin-toast")
    ? safeHook("legacy-plugin-toast", () => createLegacyPluginToastHook(ctx))
    : null

  return {
    contextWindowMonitor,
    preemptiveCompaction,
    sessionRecovery,
    sessionNotification,
    thinkMode,
    anthropicContextWindowLimitRecovery,
    autoUpdateChecker,
    agentUsageReminder,
    nonInteractiveEnv,
    editErrorRecovery,
    delegateTaskRetry,
    sisyphusJuniorNotepad,
    questionLabelTruncator,
    taskResumeInfo,
    anthropicEffort,
    legacyPluginToast,
  }
}
