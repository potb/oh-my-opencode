import type { HookName } from "../../config"
import type { BackgroundManager } from "../../features/background-agent"
import type { PluginContext } from "../types"

import {
  createCompactionContextInjector,
  createCompactionTodoPreserverHook,
} from "../../hooks"
import { safeCreateHook } from "../../shared/safe-create-hook"

type ContinuationHooks = {
  compactionContextInjector: ReturnType<typeof createCompactionContextInjector> | null
  compactionTodoPreserver: ReturnType<typeof createCompactionTodoPreserverHook> | null
}

export function createContinuationHooks(args: {
  ctx: PluginContext
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
  backgroundManager: BackgroundManager
}): ContinuationHooks {
  const { ctx, isHookEnabled, safeHookEnabled, backgroundManager } = args

  const safeHook = <T>(hookName: HookName, factory: () => T): T | null =>
    safeCreateHook(hookName, factory, { enabled: safeHookEnabled })

  const compactionContextInjector = isHookEnabled("compaction-context-injector")
    ? safeHook("compaction-context-injector", () =>
        createCompactionContextInjector({ ctx, backgroundManager }))
    : null

  const compactionTodoPreserver = isHookEnabled("compaction-todo-preserver")
    ? safeHook("compaction-todo-preserver", () => createCompactionTodoPreserverHook(ctx))
    : null

  return {
    compactionContextInjector,
    compactionTodoPreserver,
  }
}
