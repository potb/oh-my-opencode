# src/features/ — Feature Modules

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Two feature subsystems live here: the background-task engine and the built-in skills registry.

## MODULES

| Module | Scope |
|--------|-------|
| `background-agent/` | Async task lifecycle: launch, queue, poll, cancel, stale cleanup, notifications |
| `builtin-skills/` | Repo-local built-in skill registrations + authored SKILL.md assets |

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Launch / resume / cancel background task | `background-agent/manager.ts` |
| Concurrency slot management | `background-agent/concurrency.ts` |
| Polling + completion detection | `background-agent/task-poller.ts`, `session-idle-event-handler.ts` |
| Spawn-tree limits | `background-agent/subagent-spawn-limits.ts`, `spawner.ts` |
| Stale-task cleanup | `background-agent/task-history.ts`, `cancel-task-cleanup.test.ts` |
| Built-in skill registration | `builtin-skills/skills.ts`, `skills/index.ts`, `types.ts` |
| Skill prompt sections | `builtin-skills/skills/git-master-sections/` |

## CONVENTIONS

- Keep features self-contained — push cross-cutting helpers to `src/shared/`
- `background-agent/` is operational code (test edge cases aggressively); not a prompt directory
- `builtin-skills/` mixes static SKILL.md assets with TS registrations — keep that boundary explicit

## ANTI-PATTERNS

- Reintroducing removed feature-loader directories
- Placing generic helpers here when used across unrelated domains (those belong in `src/shared/`)
- Documenting repo-wide rules in this file — keep scope feature-local
