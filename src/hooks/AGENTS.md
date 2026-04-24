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
├── auto-update-checker/        # Plugin update check
├── delegate-task-retry/        # Retries failed delegations
├── edit-error-recovery/        # Recovers from failures
├── hashline-edit-diff-enhancer/ # Enhanced diff output for hashline edits
├── hashline-read-enhancer/     # Adds LINE#ID hashes to Read output
├── json-error-recovery/        # JSON parse error correction
├── legacy-plugin-toast/        # Legacy plugin name migration toast
├── non-interactive-env/        # Non-TTY environment handling
├── question-label-truncator/   # Auto-truncates question labels
├── read-image-resizer/         # Resize images for context efficiency
├── sisyphus-junior-notepad/    # Sisyphus Junior notepad
├── task-reminder/              # Task system usage reminders
├── task-resume-info/           # Resume info for cancelled tasks
├── tasks-todowrite-disabler/   # Disable TodoWrite when task system active
├── think-mode/                 # Dynamic thinking budget
├── thinking-block-validator/   # Ensures valid <thinking>
├── todo-description-override/  # Override todo descriptions
├── tool-pair-validator/        # Validate tool pair usage
├── webfetch-redirect-guard/    # Guard webfetch redirect behavior
├── write-existing-file-guard/  # Require Read before Write
└── index.ts                    # Hook aggregation + registration
```

| Hook | Event | Purpose |
|------|-------|---------|
| contextWindowMonitor | session.idle | Track context window usage |
| thinkMode | chat.params | Model variant switching (extended thinking) |
| autoUpdateChecker | session.created | Check npm for plugin updates |
| nonInteractiveEnv | chat.message | Adjust behavior for `run` command |
| editErrorRecovery | tool.execute.after | Retry failed file edits |
| delegateTaskRetry | tool.execute.after | Retry failed task delegations |
| sisyphusJuniorNotepad | chat.message | Notepad injection for subagents |
| questionLabelTruncator | tool.execute.before | Truncate long question labels |
| taskResumeInfo | chat.message | Inject task context on resume |
| anthropicEffort | chat.params | Adjust reasoning effort level |
| legacyPluginToast | chat.message | Show toast when legacy plugin name detected |

### Tier 2: Tool Guard Hooks — `create-tool-guard-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| toolOutputTruncator | tool.execute.after | Truncate oversized tool output |
| emptyTaskResponseDetector | tool.execute.after | Detect empty task responses |
| tasksTodowriteDisabler | tool.execute.before | Disable TodoWrite when task system active |
| writeExistingFileGuard | tool.execute.before | Require Read before Write on existing files |
| bashFileReadGuard | tool.execute.before | Guard bash commands that read files |
| readImageResizer | tool.execute.after | Resize large images for context efficiency |
| todoDescriptionOverride | tool.execute.before | Override todo item descriptions |
| webfetchRedirectGuard | tool.execute.before | Guard webfetch redirect behavior |
| hashlineReadEnhancer | tool.execute.after | Enhance Read output with line hashes |
| jsonErrorRecovery | tool.execute.after | Detect JSON parse errors, inject correction reminder |

### Tier 3: Transform Hooks (2) — `create-transform-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| thinkingBlockValidator | messages.transform | Validate thinking block structure |
| toolPairValidator | messages.transform | Validate tool call/result pairs |

## STANDALONE HOOKS (in src/hooks/ root)

| File | Purpose |
|------|---------|
| context-window-monitor.ts | Track context window percentage |
| tool-output-truncator.ts | Truncate tool output by token count |
| empty-task-response-detector.ts | Detect empty/failed task responses |
| session-todo-status.ts | Todo completion status tracking |

## HOW TO ADD A HOOK

1. Create `src/hooks/{name}/index.ts` with `createXXXHook(deps)` factory
2. Register in appropriate tier file (`src/plugin/hooks/create-{tier}-hooks.ts`)
3. Add hook name to `src/config/schema/hooks.ts` HookNameSchema
4. Hook receives `(event, ctx)` — return value depends on event type
