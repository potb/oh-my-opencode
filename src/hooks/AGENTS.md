# src/hooks/ — Lifecycle Hooks

**Generated:** 2026-04-11

## OVERVIEW

Session, tool-guard, transform, and continuation hooks compose the runtime surface. All hooks follow `createXXXHook(deps) → HookFunction` factory pattern.

## HOOK TIERS

### Tier 1: Session Hooks — `create-session-hooks.ts`
## STRUCTURE
```
hooks/
├── anthropic-effort/            # Reasoning effort level adjustment
├── delegate-task-retry/        # Retries failed delegations
├── edit-error-recovery/        # Recovers from failures
├── hashline-edit-diff-enhancer/ # Enhanced diff output for hashline edits
├── hashline-read-enhancer/     # Adds LINE#ID hashes to Read output
├── non-interactive-env/        # Non-TTY environment handling
├── question-label-truncator/   # Auto-truncates question labels
├── sisyphus-junior-notepad/    # Sisyphus Junior notepad
├── task-reminder/              # Task system usage reminders
├── webfetch-redirect-guard/    # Guard webfetch redirect behavior
├── write-existing-file-guard/  # Require Read before Write
└── index.ts                    # Hook aggregation + registration
```

| Hook | Event | Purpose |
|------|-------|---------|
| nonInteractiveEnv | chat.message | Adjust behavior for `run` command |
| editErrorRecovery | tool.execute.after | Retry failed file edits |
| delegateTaskRetry | tool.execute.after | Retry failed task delegations |
| sisyphusJuniorNotepad | chat.message | Notepad injection for subagents |
| questionLabelTruncator | tool.execute.before | Truncate long question labels |
| anthropicEffort | chat.params | Adjust reasoning effort level |

### Tier 2: Tool Guard Hooks — `create-tool-guard-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| toolOutputTruncator | tool.execute.after | Truncate oversized tool output |
| writeExistingFileGuard | tool.execute.before | Require Read before Write on existing files |
| webfetchRedirectGuard | tool.execute.before | Guard webfetch redirect behavior |
| hashlineReadEnhancer | tool.execute.after | Enhance Read output with line hashes |

### Tier 3: Transform Hooks — `create-transform-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| _(none)_ | — | Transform hook surface is intentionally empty |

## STANDALONE HOOKS (in src/hooks/ root)

| File | Purpose |
|------|---------|
| tool-output-truncator.ts | Truncate tool output by token count |
| session-todo-status.ts | Todo completion status tracking |

## HOW TO ADD A HOOK

1. Create `src/hooks/{name}/index.ts` with `createXXXHook(deps)` factory
2. Register in appropriate tier file (`src/plugin/hooks/create-{tier}-hooks.ts`)
3. Add hook name to `src/config/schema/hooks.ts` HookNameSchema
4. Hook receives `(event, ctx)` — return value depends on event type
