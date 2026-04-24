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

    const runToolExecuteAfterHooks = async (): Promise<void> => {
      await hooks.toolOutputTruncator?.["tool.execute.after"]?.(input, output)
      await hooks.editErrorRecovery?.["tool.execute.after"]?.(input, output)
      await hooks.delegateTaskRetry?.["tool.execute.after"]?.(input, output)
      await hooks.hashlineReadEnhancer?.["tool.execute.after"]?.(input, output)
      await hooks.webfetchRedirectGuard?.["tool.execute.after"]?.(input, output)
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
