import { z } from "zod"

export const HookNameSchema = z.enum([
  "context-window-monitor",
  "session-recovery",
  "tool-output-truncator",
  "question-label-truncator",
  "empty-task-response-detector",
  "think-mode",
  "anthropic-context-window-limit-recovery",
  "preemptive-compaction",
  "auto-update-checker",
  "non-interactive-env",
  "interactive-bash-session",

  "thinking-block-validator",
  "tool-pair-validator",
  "compaction-context-injector",
  "compaction-todo-preserver",
  "edit-error-recovery",
  "json-error-recovery",
  "delegate-task-retry",
  "sisyphus-junior-notepad",
  "task-resume-info",
  "tasks-todowrite-disabler",
  "write-existing-file-guard",
  "bash-file-read-guard",
  "anthropic-effort",
  "hashline-read-enhancer",
  "read-image-resizer",
  "todo-description-override",
  "webfetch-redirect-guard",
  "legacy-plugin-toast",
])

export type HookName = z.infer<typeof HookNameSchema>
