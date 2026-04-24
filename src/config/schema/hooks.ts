import { z } from "zod"

export const HookNameSchema = z.enum([
  "tool-output-truncator",
  "question-label-truncator",
  "non-interactive-env",
  "interactive-bash-session",

  "edit-error-recovery",
  "delegate-task-retry",
  "sisyphus-junior-notepad",
  "write-existing-file-guard",
  "anthropic-effort",
  "hashline-read-enhancer",
  "webfetch-redirect-guard",
])

export type HookName = z.infer<typeof HookNameSchema>
