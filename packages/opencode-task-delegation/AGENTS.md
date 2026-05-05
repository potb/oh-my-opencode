# packages/opencode-task-delegation — Task Delegation Plugin

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Standalone OpenCode plugin exposing only the `task` tool, backed by root delegation and background-task internals.

## ENTRYPOINT

| File | Role |
|------|------|
| `src/index.ts` | Creates `BackgroundManager`, registers `task`, forwards `event` to `handleEvent()` |
| `package.json` | Package name `opencode-task-delegation`; root export points to `dist/index.{js,d.ts}` |

## INTERNAL DEPENDENCIES

| Root source | Use |
|-------------|-----|
| `src/plugin-config.ts` | Background task config source |
| `src/features/background-agent/` | Manager lifecycle, polling, notifications |
| `src/tools/delegate-task/` | `createDelegateTask()` implementation |

## CONTRACTS

- Expose no tools except `task`.
- Shutdown any previous active `BackgroundManager` before creating a new one.
- Keep detailed delegation behavior documented in `src/tools/delegate-task/AGENTS.md`.

## ANTI-PATTERNS

- Duplicating delegation internals in the package wrapper.
- Adding unrelated tools to this package.
- Changing background-task defaults here instead of `src/plugin-config.ts`.
