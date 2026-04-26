# src/features/background-agent/ — Background Task Engine

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

43-file async task engine for background subagent execution. Owns launch/resume/cancel flow, per-model concurrency slots, poll-based completion detection, stale-task cleanup, parent-session notification injection, and spawn-tree depth/descendant limits.

## TASK LIFECYCLE

```text
LaunchInput | ResumeInput
  → pending → queued (ConcurrencyManager) → running → polling
  → completed | error | cancelled | interrupt
```

## KEY FILES

| File | Purpose |
|------|---------|
| `manager.ts` | `BackgroundManager` orchestrator — enqueue, poll, notify, cleanup, cancel |
| `spawner.ts` | Session creation, prompt injection, initial launch |
| `concurrency.ts` | FIFO slot acquire/release per `{providerID}/{modelID}` key |
| `task-poller.ts` | 3s poll, stability detection, status transitions |
| `task-history.ts` | Retention + stale removal bookkeeping |
| `subagent-spawn-limits.ts` | maxDepth + maxDescendants enforcement |
| `session-idle-event-handler.ts` | Idle-event side of completion confirmation |
| `session-status-classifier.ts` | Normalize session status during polling |
| `error-classifier.ts` | Runtime error classification |
| `loop-detector.ts` | Detect runaway loops in subagent traces |
| `compaction-aware-message-resolver.ts` | Compaction-safe message lookup |
| `abort-with-timeout.ts` | Timeout-bounded abort plumbing |
| `background-task-notification-template.ts` | Format parent-session notifications |
| `opencode-client.ts` | OpenCode session API access |
| `process-cleanup.ts` | Manager registration for process-exit cleanup |
| `session-existence.ts` | Session presence checks |
| `duration-formatter.ts` | Human-readable durations for notifications |
| `constants.ts` | Polling/timeout constants |
| `test-config.ts` | Test-only config (knip-ignored file) |
| `types.ts` | `BackgroundTask`, `LaunchInput`, `ResumeInput`, status types |
| `index.ts` | Barrel exports |

## CONCURRENCY MODEL

- Slot key: `{providerID}/{modelID}`
- Default cap from `background_task` config in `src/plugin-config.ts`
- FIFO queue per key; release on completion / error / cancel
- `concurrencyGroup` persisted so resumed tasks reacquire slots correctly

## COMPLETION + STALE RULES

- Completion requires BOTH idle-event confirmation AND stable message counts
- Polling interval: 3s
- Stale cleanup is a contract, not housekeeping — must run on schedule
- Cancellation / interruption paths must free slots immediately

## SPAWN LIMITS

- Tasks track `rootSessionID` and `spawnDepth`
- Limit checks prevent runaway descendant trees
- Reuse / resume existing sessions before spawning new ones

## TESTING FOCUS

High-signal tests: `manager.test.ts`, `manager.polling.test.ts`, `manager-circuit-breaker.test.ts`, `manager-session-permission.test.ts`, `task-poller.test.ts`, `cancel-task-cleanup.test.ts`, `task-history*.test.ts`, `subagent-spawn-limits.test.ts`, `session-idle-event-handler.test.ts`, `loop-detector.test.ts`.

Mock lifecycle/concurrency edges aggressively. Avoid depending on real sessions.

## ANTI-PATTERNS

- Slot leaks in error / cancel / resume paths
- Marking tasks complete from a single signal
- Treating stale cleanup as optional
- Moving generic helpers here when they belong in `src/shared/`
