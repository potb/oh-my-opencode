# src/features/ — Feature Modules

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Feature-layer runtime modules wired into plugin/bootstrap code. Two real families live here: the background-task engine and builtin skill definitions.

## MODULE MAP

| Module | Size signal | Purpose |
|--------|-------------|---------|
| `background-agent/` | largest and most operationally complex subtree here | Async task lifecycle, concurrency, polling, stale cleanup, notifications |
| `builtin-skills/` | compact root with nested skill assets/prompt fragments | Repo-local built-in skill definitions and prompt fragments |

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Background task launch/resume/cancel | `background-agent/manager.ts` | `BackgroundManager` orchestration boundary |
| Polling/completion rules | `background-agent/task-poller.ts`, `session-idle-event-handler.ts` | Idle + stability detection |
| Concurrency and stale handling | `background-agent/concurrency.ts`, `task-history.ts`, `constants.ts` | Per-model/provider limits and cleanup |
| Spawn limits | `background-agent/subagent-spawn-limits.ts`, `spawner.ts` | Prevent background-agent explosion |
| Built-in skill registry | `builtin-skills/skills.ts`, `types.ts` | `createBuiltinSkills()` |
| Git skill prompt fragments | `builtin-skills/skills/git-master-sections/` | Commit/rebase/history-search prompt sections |

## CONVENTIONS

- Keep feature modules self-contained; push cross-cutting helpers back to `src/shared/`.
- `background-agent/` is operational code, not a prompt directory; test edge cases exhaustively.
- `builtin-skills/` mixes static SKILL.md assets with TypeScript prompt builders; keep those responsibilities explicit.

## ANTI-PATTERNS

- Do not reintroduce removed feature-loader directories in this subtree.
- Do not place generic shared helpers here when they are imported across unrelated domains.
- Do not document repo-wide rules here; keep this file feature-scoped.
