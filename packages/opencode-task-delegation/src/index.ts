import type { Plugin } from "@opencode-ai/plugin"

import { PLUGIN_CONFIG } from "../../../src/plugin-config"
import { BackgroundManager } from "../../../src/features/background-agent"
import { createDelegateTask } from "../../../src/tools/delegate-task"

let activeBackgroundManager: BackgroundManager | null = null

const TaskDelegationPlugin: Plugin = async (ctx) => {
  await activeBackgroundManager?.shutdown()

  const backgroundManager = new BackgroundManager(
    ctx,
    PLUGIN_CONFIG.background_task,
  )
  activeBackgroundManager = backgroundManager

  return {
    name: "opencode-task-delegation",
    tool: {
      task: createDelegateTask({
        manager: backgroundManager,
        client: ctx.client,
        directory: ctx.directory,
        syncPollTimeoutMs: PLUGIN_CONFIG.background_task.syncPollTimeoutMs,
      }),
    },
    event: async (input: { event: Parameters<BackgroundManager["handleEvent"]>[0] }): Promise<void> => {
      await backgroundManager.handleEvent(input.event)
    },
  }
}

export default TaskDelegationPlugin
