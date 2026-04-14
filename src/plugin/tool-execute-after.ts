import { consumeToolMetadata } from "../features/tool-metadata-store"
import type { CreatedHooks } from "../create-hooks"
import { log } from "../shared"
import type { PluginContext } from "./types"

export function createToolExecuteAfterHandler(args: {
  ctx: PluginContext
  hooks: CreatedHooks
}): (
  input: { tool: string; sessionID: string; callID: string },
  output:
    | { title: string; output: string; metadata: Record<string, unknown> }
    | undefined,
) => Promise<void> {
  const { hooks } = args

  return async (
    input: { tool: string; sessionID: string; callID: string },
    output: { title: string; output: string; metadata: Record<string, unknown> } | undefined,
  ): Promise<void> => {
    if (!output) return

    const stored = consumeToolMetadata(input.sessionID, input.callID)
    if (stored) {
      if (stored.title) {
        output.title = stored.title
      }
      if (stored.metadata) {
        output.metadata = { ...output.metadata, ...stored.metadata }
      }
    }

    const runToolExecuteAfterHooks = async (): Promise<void> => {
      await hooks.toolOutputTruncator?.["tool.execute.after"]?.(input, output)
      await hooks.claudeCodeHooks?.["tool.execute.after"]?.(input, output)
      await hooks.preemptiveCompaction?.["tool.execute.after"]?.(input, output)
      await hooks.contextWindowMonitor?.["tool.execute.after"]?.(input, output)
      await hooks.commentChecker?.["tool.execute.after"]?.(input, output)
      await hooks.directoryAgentsInjector?.["tool.execute.after"]?.(input, output)
      await hooks.directoryReadmeInjector?.["tool.execute.after"]?.(input, output)
      await hooks.rulesInjector?.["tool.execute.after"]?.(input, output)
      await hooks.emptyTaskResponseDetector?.["tool.execute.after"]?.(input, output)
      await hooks.agentUsageReminder?.["tool.execute.after"]?.(input, output)
      await hooks.editErrorRecovery?.["tool.execute.after"]?.(input, output)
      await hooks.delegateTaskRetry?.["tool.execute.after"]?.(input, output)
      await hooks.atlasHook?.["tool.execute.after"]?.(input, output)
      await hooks.taskResumeInfo?.["tool.execute.after"]?.(input, output)
      await hooks.readImageResizer?.["tool.execute.after"]?.(input, output)
      await hooks.hashlineReadEnhancer?.["tool.execute.after"]?.(input, output)
      await hooks.webfetchRedirectGuard?.["tool.execute.after"]?.(input, output)
      await hooks.jsonErrorRecovery?.["tool.execute.after"]?.(input, output)
    }

    if (input.tool === "extract" || input.tool === "discard") {
      const originalOutput = {
        title: output.title,
        output: output.output,
        metadata: { ...output.metadata },
      }

      try {
        await runToolExecuteAfterHooks()
      } catch (error) {
        output.title = originalOutput.title
        output.output = originalOutput.output
        output.metadata = originalOutput.metadata
        log("[tool-execute-after] Failed to process extract/discard hooks", {
          tool: input.tool,
          sessionID: input.sessionID,
          callID: input.callID,
          error,
        })
      }

      return
    }

    await runToolExecuteAfterHooks()
  }
}
