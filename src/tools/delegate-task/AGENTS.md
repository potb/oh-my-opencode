# src/tools/delegate-task/ — Task Delegation Engine

**Generated:** 2026-04-11

## OVERVIEW

Task delegation implementation for the fixed-product runtime. Supports direct subagent delegation plus sync/background execution flows.

## TWO EXECUTION MODES

| Mode | Flow | Use Case |
|------|------|----------|
| **Background** (`run_in_background=true`) | Launch → BackgroundManager → poll → notify parent | Explore, librarian, parallel work |
| **Sync** (`run_in_background=false`) | Create session → send prompt → poll until idle → return result | Sequential tasks needing immediate result |

## KEY FILES

| File | Purpose |
|------|---------|
| `tools.ts` | `createDelegateTask()` factory — main entry point |
| `executor.ts` | Route to background or sync execution |
| `types.ts` | `DelegateTaskArgs`, `DelegateTaskToolOptions`, `ToolContextWithMetadata` |
| `subagent-resolver.ts` | Map subagent_type → agent + model |
| `model-selection.ts` | Model availability checking + fallback |
| `prompt-builder.ts` | Build system/user prompt for direct subagent delegation |

## SYNC EXECUTION CHAIN

```
sync-task.ts → sync-session-creator.ts → sync-prompt-sender.ts → sync-session-poller.ts → sync-result-fetcher.ts
```

Each file handles one step. `sync-continuation.ts` handles session continuation (resume with session_id).

## BACKGROUND EXECUTION

```
background-task.ts → BackgroundManager.launch() → (async polling) → background-continuation.ts
```

`background-continuation.ts` handles `session_id` resume for existing background tasks.

## MODEL STRING PARSER

`model-string-parser.ts` handles `"model variant"` format (e.g., `"gpt-5.3-codex medium"` → model=`gpt-5.3-codex`, variant=`medium`).

## FIXED-PRODUCT CONSTRAINTS

- Category-based task routing has been removed from the fixed-product runtime.
- Skill loading through the `task` tool has been removed from the fixed-product runtime.
- Direct `subagent_type` delegation is the supported path.
