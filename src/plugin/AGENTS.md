# src/plugin/ — Hook Handlers and Runtime Glue

**Generated:** 2026-04-26 | **Commit:** 5af01eb4

## OVERVIEW

Glue between bootstrap and OpenCode runtime. Owns per-surface handler implementations, hook composition helpers, runtime overrides, normalization, and the tool registry boundary.

## OPENCODE HANDLER FILES

| File | Surface | Purpose |
|------|---------|---------|
| `tool-registry.ts` | `tool` | Assemble plugin tool surface |
| `chat-message.ts` | `chat.message` | First-message / session setup |
| `chat-params.ts` | `chat.params` | Effort / variant handling |
| `chat-headers.ts` | `chat.headers` | Copilot header injection |
| `event.ts` | `event` | Session lifecycle dispatch (uses `event-hook-dispatch.ts`) |
| `tool-execute-before.ts` | `tool.execute.before` | Pre-tool guards |
| `tool-execute-after.ts` | `tool.execute.after` | Post-tool processing |
| `messages-transform.ts` | `experimental.chat.messages.transform` | Message transform surface |
| `system-transform.ts` | `experimental.chat.system.transform` | System-prompt transform |

The `config` surface is provided by the runtime config hook from `src/create-managers.ts`.

## COMPOSITION HELPERS (`hooks/`)

| File | Role |
|------|------|
| `hooks/create-core-hooks.ts` | Top-level hook record assembly |
| `hooks/create-session-hooks.ts` | Session-related hook composition |
| `hooks/create-tool-guard-hooks.ts` | Tool-guard hook composition |
| `hooks/create-transform-hooks.ts` | Transform hook composition |

## SUPPORT FILES

| File | Purpose |
|------|---------|
| `runtime-config-hook.ts` | Runtime config loading + caching |
| `runtime-agent-config.ts` | Per-session agent config resolution |
| `session-agent-resolver.ts` | Resolve owning agent for a session |
| `session-status-normalizer.ts` | Normalize event / session status |
| `recent-synthetic-idles.ts` | Synthetic idle-event dedup |
| `normalize-tool-arg-schemas.ts` | Tool argument schema normalization |
| `ultrawork-model-override.ts` | Message-triggered ultrawork model override |
| `ultrawork-db-model-override.ts` | DB-level ultrawork mutation path |
| `ultrawork-variant-availability.ts` | Variant availability for ultrawork |
| `event-hook-dispatch.ts` | Internal event-hook dispatch |
| `types.ts` | Plugin-layer shared types |

## WHERE TO START

| Task | File |
|------|------|
| Add / remove a tool | `tool-registry.ts` (registry boundary only) |
| Change lifecycle behavior | `event.ts` + `hooks/create-*.ts` |
| Change prompt / message transforms | `chat-message.ts`, `messages-transform.ts`, `system-transform.ts` |
| Runtime config issues | `runtime-config-hook.ts` |

## CONVENTIONS

- Handlers stay thin — push reusable logic into `src/shared/`, `src/hooks/`, or `src/tools/`
- `tool-registry.ts` is the registry boundary, NOT a place for tool implementation logic
- `hooks/create-*.ts` files assemble hook records, never own feature behavior

## ANTI-PATTERNS

- Adding tool implementations to `tool-registry.ts`
- Letting handler files balloon with cross-cutting helpers
