import {
  createThinkingBlockValidatorHook,
  createToolPairValidatorHook,
} from "../../hooks"
import { safeCreateHook } from "../../shared/safe-create-hook"

type TransformHooks = {
  thinkingBlockValidator: ReturnType<typeof createThinkingBlockValidatorHook> | null
  toolPairValidator: ReturnType<typeof createToolPairValidatorHook> | null
}

export function createTransformHooks(args: {
  isHookEnabled: (hookName: string) => boolean
  safeHookEnabled?: boolean
}): TransformHooks {
  const { isHookEnabled } = args
  const safeHookEnabled = args.safeHookEnabled ?? true

  const thinkingBlockValidator = isHookEnabled("thinking-block-validator")
    ? safeCreateHook(
        "thinking-block-validator",
        () => createThinkingBlockValidatorHook(),
        { enabled: safeHookEnabled },
      )
    : null

  const toolPairValidator = isHookEnabled("tool-pair-validator")
    ? safeCreateHook(
        "tool-pair-validator",
        () => createToolPairValidatorHook(),
        { enabled: safeHookEnabled },
      )
    : null

  return {
    thinkingBlockValidator,
    toolPairValidator,
  }
}
