import type { CreatedHooks } from "../create-hooks"
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
      await hooks.webfetchRedirectGuard?.["tool.execute.after"]?.(input, output)
    }

    await runToolExecuteAfterHooks()
  }
}
