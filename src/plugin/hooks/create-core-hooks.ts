import type { HookName, OhMyOpenCodeConfig } from "../../config"
import type { PluginContext } from "../types"
import type { ModelCacheState } from "../../plugin-state"

import { createSessionHooks } from "./create-session-hooks"
import { createToolGuardHooks } from "./create-tool-guard-hooks"
import { createTransformHooks } from "./create-transform-hooks"

export function createCoreHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  isHookEnabled: (hookName: HookName) => boolean
}) {
  const { ctx, pluginConfig, modelCacheState, isHookEnabled } = args

  const session = createSessionHooks({
    ctx,
    pluginConfig,
    modelCacheState,
    isHookEnabled,
  })

  const tool = createToolGuardHooks({
    ctx,
    pluginConfig,
    modelCacheState,
    isHookEnabled,
  })

  const transform = createTransformHooks({
    isHookEnabled: (name) => isHookEnabled(name as HookName),
  })

  return {
    ...session,
    ...tool,
    ...transform,
  }
}
