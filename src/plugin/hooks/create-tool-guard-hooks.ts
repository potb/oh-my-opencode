import type { HookName, OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createToolOutputTruncatorHook,
  createEmptyTaskResponseDetectorHook,
  createTasksTodowriteDisablerHook,
  createWriteExistingFileGuardHook,
  createBashFileReadGuardHook,
  createHashlineReadEnhancerHook,
  createReadImageResizerHook,
  createJsonErrorRecoveryHook,
  createTodoDescriptionOverrideHook,
  createWebFetchRedirectGuardHook,
} from "../../hooks"
import { safeCreateHook } from "../../shared/safe-create-hook"

type ToolGuardHooks = {
  toolOutputTruncator: ReturnType<typeof createToolOutputTruncatorHook> | null
  emptyTaskResponseDetector: ReturnType<typeof createEmptyTaskResponseDetectorHook> | null
  tasksTodowriteDisabler: ReturnType<typeof createTasksTodowriteDisablerHook> | null
  writeExistingFileGuard: ReturnType<typeof createWriteExistingFileGuardHook> | null
  bashFileReadGuard: ReturnType<typeof createBashFileReadGuardHook> | null
  hashlineReadEnhancer: ReturnType<typeof createHashlineReadEnhancerHook> | null
  jsonErrorRecovery: ReturnType<typeof createJsonErrorRecoveryHook> | null
  readImageResizer: ReturnType<typeof createReadImageResizerHook> | null
  todoDescriptionOverride: ReturnType<typeof createTodoDescriptionOverrideHook> | null
  webfetchRedirectGuard: ReturnType<typeof createWebFetchRedirectGuardHook> | null
}

export function createToolGuardHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}): ToolGuardHooks {
  const { ctx, pluginConfig, modelCacheState, isHookEnabled, safeHookEnabled } = args
  const safeHook = <T>(hookName: HookName, factory: () => T): T | null =>
    safeCreateHook(hookName, factory, { enabled: safeHookEnabled })

  const toolOutputTruncator = isHookEnabled("tool-output-truncator")
    ? safeHook("tool-output-truncator", () =>
        createToolOutputTruncatorHook(ctx, {
          modelCacheState,
          experimental: pluginConfig.experimental,
        }))
    : null

  const emptyTaskResponseDetector = isHookEnabled("empty-task-response-detector")
    ? safeHook("empty-task-response-detector", () => createEmptyTaskResponseDetectorHook(ctx))
    : null

  const tasksTodowriteDisabler = isHookEnabled("tasks-todowrite-disabler")
    ? safeHook("tasks-todowrite-disabler", () =>
        createTasksTodowriteDisablerHook({ experimental: pluginConfig.experimental }))
    : null

  const writeExistingFileGuard = isHookEnabled("write-existing-file-guard")
    ? safeHook("write-existing-file-guard", () => createWriteExistingFileGuardHook(ctx))
    : null

  const bashFileReadGuard = isHookEnabled("bash-file-read-guard")
    ? safeHook("bash-file-read-guard", () => createBashFileReadGuardHook())
    : null

  const hashlineReadEnhancer = isHookEnabled("hashline-read-enhancer")
    ? safeHook("hashline-read-enhancer", () => createHashlineReadEnhancerHook(ctx, { hashline_edit: { enabled: pluginConfig.hashline_edit ?? false } }))
    : null

  const jsonErrorRecovery = isHookEnabled("json-error-recovery")
    ? safeHook("json-error-recovery", () => createJsonErrorRecoveryHook(ctx))
    : null

  const readImageResizer = isHookEnabled("read-image-resizer")
    ? safeHook("read-image-resizer", () => createReadImageResizerHook(ctx))
    : null

  const todoDescriptionOverride = isHookEnabled("todo-description-override")
    ? safeHook("todo-description-override", () => createTodoDescriptionOverrideHook())
    : null

  const webfetchRedirectGuard = isHookEnabled("webfetch-redirect-guard")
    ? safeHook("webfetch-redirect-guard", () => createWebFetchRedirectGuardHook(ctx))
    : null

  return {
    toolOutputTruncator,
    emptyTaskResponseDetector,
    tasksTodowriteDisabler,
    writeExistingFileGuard,
    bashFileReadGuard,
    hashlineReadEnhancer,
    jsonErrorRecovery,
    readImageResizer,
    todoDescriptionOverride,
    webfetchRedirectGuard,
  }
}
