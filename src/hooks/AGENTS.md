# src/hooks/ — 50 Lifecycle Hooks

**Generated:** 2026-04-11

## OVERVIEW

50 hooks across dedicated modules and standalone files. Three-tier composition: Core(43) + Continuation(5) + Skill(1). All hooks follow `createXXXHook(deps) → HookFunction` factory pattern.

## HOOK TIERS

### Tier 1: Session Hooks (24) — `create-session-hooks.ts`
## STRUCTURE
```
hooks/
├── agent-usage-reminder/         # Reminds about available agents
├── anthropic-context-window-limit-recovery/ # Auto-summarize
├── anthropic-effort/            # Reasoning effort level adjustment
├── auto-slash-command/         # Detects /command patterns
├── auto-update-checker/        # Plugin update check
├── background-notification/    # OS notification
├── claude-code-hooks/          # settings.json compat layer
├── comment-checker/            # Prevents AI slop
├── compaction-context-injector/ # Injects context on compaction
├── compaction-todo-preserver/  # Preserves todos through compaction
├── delegate-task-retry/        # Retries failed delegations
├── directory-agents-injector/  # Auto-injects AGENTS.md
├── directory-readme-injector/  # Auto-injects README.md
├── edit-error-recovery/        # Recovers from failures
├── hashline-edit-diff-enhancer/ # Enhanced diff output for hashline edits
├── hashline-read-enhancer/     # Adds LINE#ID hashes to Read output
├── interactive-bash-session/   # Tmux session management
├── json-error-recovery/        # JSON parse error correction
├── keyword-detector/           # ultrawork/search/analyze modes
├── legacy-plugin-toast/        # Legacy plugin name migration toast
├── model-fallback/             # Provider-level model fallback
├── no-sisyphus-gpt/            # Block Sisyphus from GPT
├── non-interactive-env/        # Non-TTY environment handling
├── prometheus-md-only/         # Planner read-only mode
├── question-label-truncator/   # Auto-truncates question labels
├── read-image-resizer/         # Resize images for context efficiency
├── rules-injector/             # Conditional rules
├── session-recovery/           # Auto-recovers from crashes
├── sisyphus-junior-notepad/    # Sisyphus Junior notepad
├── task-reminder/              # Task system usage reminders
├── task-resume-info/           # Resume info for cancelled tasks
├── tasks-todowrite-disabler/   # Disable TodoWrite when task system active
├── think-mode/                 # Dynamic thinking budget
├── thinking-block-validator/   # Ensures valid <thinking>
├── todo-description-override/  # Override todo descriptions
├── tool-pair-validator/        # Validate tool pair usage
├── unstable-agent-babysitter/  # Monitor unstable agent behavior
├── webfetch-redirect-guard/    # Guard webfetch redirect behavior
├── write-existing-file-guard/  # Require Read before Write
└── index.ts                    # Hook aggregation + registration
```

| Hook | Event | Purpose |
|------|-------|---------|
| contextWindowMonitor | session.idle | Track context window usage |
| preemptiveCompaction | session.idle | Trigger compaction before limit |
| sessionRecovery | session.error | Auto-retry on recoverable errors |
| sessionNotification | session.idle | OS notifications on completion |
| thinkMode | chat.params | Model variant switching (extended thinking) |
| anthropicContextWindowLimitRecovery | session.error | Multi-strategy context recovery (truncation, compaction) |
| autoUpdateChecker | session.created | Check npm for plugin updates |
| agentUsageReminder | chat.message | Remind about available agents |
| nonInteractiveEnv | chat.message | Adjust behavior for `run` command |
| interactiveBashSession | tool.execute | Tmux session for interactive tools |
| editErrorRecovery | tool.execute.after | Retry failed file edits |
| delegateTaskRetry | tool.execute.after | Retry failed task delegations |
| prometheusMdOnly | tool.execute.before | Enforce .md-only writes for Prometheus |
| sisyphusJuniorNotepad | chat.message | Notepad injection for subagents |
| questionLabelTruncator | tool.execute.before | Truncate long question labels |
| taskResumeInfo | chat.message | Inject task context on resume |
| anthropicEffort | chat.params | Adjust reasoning effort level |
| modelFallback | chat.params | Provider-level model fallback on errors |
| noSisyphusGpt | chat.message | Block Sisyphus from using GPT models (toast warning) |
| legacyPluginToast | chat.message | Show toast when legacy plugin name detected |

### Tier 2: Tool Guard Hooks (14) — `create-tool-guard-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| commentChecker | tool.execute.after | Block AI-generated comment patterns |
| toolOutputTruncator | tool.execute.after | Truncate oversized tool output |
| directoryAgentsInjector | tool.execute.before | Inject dir AGENTS.md into context |
| directoryReadmeInjector | tool.execute.before | Inject dir README.md into context |
| emptyTaskResponseDetector | tool.execute.after | Detect empty task responses |
| rulesInjector | tool.execute.before | Conditional rules injection (AGENTS.md, config) |
| tasksTodowriteDisabler | tool.execute.before | Disable TodoWrite when task system active |
| writeExistingFileGuard | tool.execute.before | Require Read before Write on existing files |
| bashFileReadGuard | tool.execute.before | Guard bash commands that read files |
| readImageResizer | tool.execute.after | Resize large images for context efficiency |
| todoDescriptionOverride | tool.execute.before | Override todo item descriptions |
| webfetchRedirectGuard | tool.execute.before | Guard webfetch redirect behavior |
| hashlineReadEnhancer | tool.execute.after | Enhance Read output with line hashes |
| jsonErrorRecovery | tool.execute.after | Detect JSON parse errors, inject correction reminder |

### Tier 3: Transform Hooks (5) — `create-transform-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| claudeCodeHooks | messages.transform | Claude Code settings.json compatibility |
| keywordDetector | messages.transform | Detect ultrawork/search/analyze modes |
| contextInjectorMessagesTransform | messages.transform | Inject AGENTS.md/README.md into context |
| thinkingBlockValidator | messages.transform | Validate thinking block structure |
| toolPairValidator | messages.transform | Validate tool call/result pairs |

### Tier 4: Continuation Hooks (5) — `create-continuation-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| compactionContextInjector | session.compacted | Re-inject context after compaction |
| compactionTodoPreserver | session.compacted | Preserve todos through compaction |
| unstableAgentBabysitter | session.idle | Monitor unstable agent behavior |
| backgroundNotificationHook | event | Background task completion notifications |

### Tier 5: Skill Hooks (1) — `create-skill-hooks.ts`

| Hook | Event | Purpose |
|------|-------|---------|
| autoSlashCommand | chat.message | Auto-detect `/command` in user input |

## KEY HOOKS (COMPLEX)

### anthropic-context-window-limit-recovery (31 files, ~2232 LOC)
Multi-strategy recovery when hitting context limits. Strategies: truncation, compaction, summarization.

### keyword-detector (~1665 LOC)
Detects modes from user input: ultrawork, search, analyze, prove-yourself. Injects mode-specific system prompts.

### rules-injector (19 files, ~1604 LOC)
Conditional rules injection from AGENTS.md, config, skill rules. Evaluates conditions to determine which rules apply.

## STANDALONE HOOKS (in src/hooks/ root)

| File | Purpose |
|------|---------|
| context-window-monitor.ts | Track context window percentage |
| preemptive-compaction.ts | Trigger compaction before hard limit |
| tool-output-truncator.ts | Truncate tool output by token count |
| session-notification.ts + 4 helpers | OS notification on session completion |
| empty-task-response-detector.ts | Detect empty/failed task responses |
| session-todo-status.ts | Todo completion status tracking |

## HOW TO ADD A HOOK

1. Create `src/hooks/{name}/index.ts` with `createXXXHook(deps)` factory
2. Register in appropriate tier file (`src/plugin/hooks/create-{tier}-hooks.ts`)
3. Add hook name to `src/config/schema/hooks.ts` HookNameSchema
4. Hook receives `(event, ctx)` — return value depends on event type
