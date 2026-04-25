# src/plugin/ — Hook Handlers and Runtime Glue

**Generated:** 2026-04-25 | **Commit:** 51061ac8

## OVERVIEW

Glue layer between bootstrap code and OpenCode runtime. This directory owns handler implementations, handler composition helpers, runtime overrides, and tool registry wiring.

## OPENCODE HANDLER FILES

| File | Surface | Purpose |
|------|---------|---------|
| `tool-registry.ts` | `tool` | Assemble plugin tool surface |
| `chat-message.ts` | `chat.message` | First-message/session setup |
| `chat-params.ts` | `chat.params` | Effort/variant handling |
| `chat-headers.ts` | `chat.headers` | Copilot header injection |
| `event.ts` | `event` | Session lifecycle dispatch |
| `tool-execute-before.ts` | `tool.execute.before` | Pre-tool guards |
| `tool-execute-after.ts` | `tool.execute.after` | Post-tool processing |
| `messages-transform.ts` | `experimental.chat.messages.transform` | Message transform surface |
| `system-transform.ts` | `experimental.chat.system.transform` | System-prompt transform |

`config` is provided by the runtime config hook created in `src/create-managers.ts`.

## COMPOSITION HELPERS

| File | Role |
|------|------|
| `hooks/create-session-hooks.ts` | Session hook composition |
| `hooks/create-tool-guard-hooks.ts` | Tool-guard hook composition |
| `hooks/create-transform-hooks.ts` | Transform hook composition |
| `hooks/create-core-hooks.ts` | Aggregate the composed hook record |

## SUPPORT FILES

| File | Purpose |
|------|---------|
| `runtime-config-hook.ts` | Runtime config loading/caching |
| `available-categories.ts` | Build category metadata for prompts |
| `session-agent-resolver.ts` | Resolve session owner agent |
| `session-status-normalizer.ts` | Normalize event/session state |
| `recent-synthetic-idles.ts` | Idle-event dedup helper |
| `ultrawork-model-override.ts` | Message-triggered model override |
| `ultrawork-db-model-override.ts` | DB-level ultrawork mutation path |
| `types.ts` | Plugin-layer shared types |

## WHERE TO START

- Adding/removing tools: `tool-registry.ts`
- Changing lifecycle behavior: `event.ts` + `hooks/create-*.ts`
- Changing prompt/message transforms: `chat-message.ts`, `messages-transform.ts`, `system-transform.ts`
- Runtime config issues: `runtime-config-hook.ts`

## CONVENTIONS

- Keep handlers thin; push reusable logic into `src/shared/`, `src/hooks/`, or `src/tools/`.
- `tool-registry.ts` is the registry boundary, not the place for tool implementation logic.
- Composition files should assemble hook records, not own feature behavior.
