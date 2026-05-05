# src/tools/delegate-task/ — Task Delegation Engine

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Implementation of the `task` tool. Routes subagent work through either sync or background execution and provides resume / continuation flows.

Also consumed by `packages/opencode-task-delegation`, which exposes only this tool as a standalone OpenCode plugin.

## EXECUTION MODES

| Mode | Trigger | Flow |
|------|---------|------|
| Background | `run_in_background=true` | Launch via `BackgroundManager` → poll → notify parent |
| Sync | `run_in_background=false` | Create session → send prompt → poll until idle → return result |

## KEY FILES

| File | Purpose |
|------|---------|
| `tools.ts` | `createDelegateTask()` factory — main entry |
| `executor.ts`, `executor-types.ts` | Route to background vs sync |
| `types.ts`, `task-schema.ts` | `DelegateTaskArgs`, `ToolContextWithMetadata`, schema |
| `subagent-resolver.ts`, `subagent-discovery.ts`, `sisyphus-junior-agent.ts` | Map `subagent_type` to agent + model |
| `model-selection.ts`, `model-string-parser.ts`, `available-models.ts`, `delegated-model-config.ts` | Model availability + `"model variant"` parsing |
| `prompt-builder.ts` | Build subagent system + user prompts |
| `parent-context-resolver.ts` | Resolve parent session context |
| `error-formatting.ts` | Surface delegation errors |
| `time-formatter.ts`, `timing.ts` | Timing helpers |
| `token-limiter.ts` | Output / context token caps |
| `constants.ts` | Internal constants |

## PACKAGE WRAPPER

`packages/opencode-task-delegation/src/index.ts` creates a `BackgroundManager`, registers `task: createDelegateTask(...)`, forwards events to `BackgroundManager.handleEvent()`, and shuts down the previous manager on reload.

## SYNC EXECUTION CHAIN

```text
sync-task.ts
  → sync-session-creator.ts
  → sync-prompt-sender.ts
  → sync-session-poller.ts
  → sync-result-fetcher.ts
```

`sync-continuation.ts` + `sync-continuation-deps.ts` + `sync-task-deps.ts` handle resume via `session_id`.

## BACKGROUND EXECUTION

```text
background-task.ts → BackgroundManager.launch() → (async polling)
background-continuation.ts → resume by session_id
```

## MOCKS / KNIP-IGNORED

`zauc-mocks-subagent-resolver/` — test mocks. Knip ignores listed in `knip.ts`.

## CONTRACTS

- Direct `subagent_type` delegation is the supported delegation path for fixed-product runtime
- Model string format: `"<model> <variant>"` (e.g. `"gpt-5.3-codex medium"`)
- Token caps live in `token-limiter.ts`; don't bypass them at call sites
- Package wrapper must not change delegation behavior; update this source tree instead

## ANTI-PATTERNS

- Bypassing the executor router with direct sync/background calls from tools
- Embedding model availability logic into `prompt-builder.ts`
- Letting subagent-resolver fall back to non-fixed-product agents
