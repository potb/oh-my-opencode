import type { OhMyOpenCodeConfig } from "./config"
import type { ModelCacheState } from "./plugin-state"
import type { PluginContext } from "./plugin/types"

import { BackgroundManager } from "./features/background-agent"
import { registerManagerForCleanup } from "./features/background-agent/process-cleanup"
import { createConfigHandler } from "./plugin-handlers"

type CreateManagersDeps = {
  BackgroundManagerClass: typeof BackgroundManager
  registerManagerForCleanupFn: typeof registerManagerForCleanup
  createConfigHandlerFn: typeof createConfigHandler
}

const defaultCreateManagersDeps: CreateManagersDeps = {
  BackgroundManagerClass: BackgroundManager,
  registerManagerForCleanupFn: registerManagerForCleanup,
  createConfigHandlerFn: createConfigHandler,
}

export type Managers = {
  backgroundManager: BackgroundManager
  configHandler: ReturnType<typeof createConfigHandler>
}

export function createManagers(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  deps?: Partial<CreateManagersDeps>
}): Managers {
  const { ctx, pluginConfig, modelCacheState } = args
  const deps = { ...defaultCreateManagersDeps, ...args.deps }

  const backgroundManager = new deps.BackgroundManagerClass(
    ctx,
    pluginConfig.background_task,
  )

  const configHandler = deps.createConfigHandlerFn({
    ctx: { directory: ctx.directory, client: ctx.client },
    pluginConfig,
    modelCacheState,
  })

  return {
    backgroundManager,
    configHandler,
  }
}
