# src/features/background-agent/ — Core Orchestration Engine

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

43-file async task engine for background subagent execution. Owns launch/resume/cancel flows, per-model concurrency, poll-based completion, stale-task cleanup, notification injection, and subagent spawn limits.

## TASK LIFECYCLE

```text
LaunchInput/ResumeInput
  → pending
  → queued (ConcurrencyManager)
  → running
  → polling
  → completed | error | cancelled | interrupt
```

## KEY FILES

| File | Purpose |
|------|---------|
| `manager.ts` | `BackgroundManager` orchestration boundary |
| `spawner.ts` | Session creation, prompt injection, initial launch |
| `concurrency.ts` | FIFO slot acquisition/release per concurrency key |
| `task-poller.ts` | 3s polling, stability detection, completion/error transitions |
| `task-history.ts` | Task retention, stale cleanup, history bookkeeping |
| `subagent-spawn-limits.ts` | maxDepth / maxDescendants enforcement |
| `session-idle-event-handler.ts` | Idle-event side of completion detection |
| `session-status-classifier.ts` | Normalize session status during polling |
| `error-classifier.ts` | Runtime error classification |
| `types.ts` | `BackgroundTask`, `LaunchInput`, `ResumeInput`, status types |

## CONCURRENCY MODEL

- Key format: `{providerID}/{modelID}`
- Default limit comes from `background_task` config
- FIFO queue, release on completion/error/cancel
- `concurrencyGroup` persists enough state to re-acquire on resume

## COMPLETION + STALE RULES

- Completion requires both idle-event confirmation and stable message counts
- Polling interval: 3s
- Stale-task cleanup is part of the contract, not incidental maintenance
- Cancellation/interruption paths must free slots immediately

## SPAWN LIMITS

- Background tasks track `rootSessionID` and `spawnDepth`
- Limit checks prevent runaway descendant trees
- Reuse/resume existing sessions when possible instead of spawning blindly

## TESTING FOCUS

- This subtree is test-heavy by design
- High-signal tests: `manager.test.ts`, `manager.polling.test.ts`, `task-poller.test.ts`, `cancel-task-cleanup.test.ts`, `task-history*.test.ts`, `subagent-spawn-limits.test.ts`
- Mock lifecycle/concurrency edges aggressively; avoid depending on real sessions

## ANTI-PATTERNS

- Slot leaks after error/cancel/resume paths
- Marking tasks complete from one signal only
- Treating stale cleanup as optional housekeeping
- Moving generic helpers here when they belong in `src/shared/`
