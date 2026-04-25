# src/ — Plugin Source

**Generated:** 2026-04-25 | **Commit:** 51061ac8

## OVERVIEW

Source root for plugin bootstrap plus the main runtime domains: agents, config, features, hooks, plugin handlers/helpers, shared infrastructure, and tools.

## INITIALIZATION PATH

```text
index.ts
  → plugin-config.ts
  → create-managers.ts
  → create-tools.ts
  → create-hooks.ts
  → plugin-interface.ts
```

## KEY FILES

| File | Purpose |
|------|---------|
| `index.ts` | Exports `OhMyOpenCodePlugin` |
| `plugin-config.ts` | Single TS constants file, sole source of truth for config |
| `create-managers.ts` | `BackgroundManager` + runtime config hook |
| `create-tools.ts` | Calls `createToolRegistry()` |
| `create-hooks.ts` | Builds composed hook record |
| `plugin-interface.ts` | Exposes 10 OpenCode hook surfaces |
| `plugin-state.ts` | Model cache state helpers |
| `fixed-product.ts` | Fixed-product agent names / removals |

## REAL SUBDIRECTORIES

| Directory | Role |
|-----------|------|
| `agents/` | Agent prompts, model routing, agent factories |
| `config/` | Plain TypeScript config type definitions |
| `features/` | Background-agent engine, builtin skills, loaders |
| `generated/` | Generated artifacts committed into source when needed |
| `hooks/` | Hook implementations and hook-only helpers |
| `plugin/` | Hook handlers, hook composition, runtime plumbing |
| `shared/` | Cross-cutting utilities and caches |
| `testing/` | Reserved helper area for source-level testing support |
| `tools/` | Tool definitions and tool submodules |

## PLUGIN INTERFACE SURFACE

`plugin-interface.ts` wires:
- `tool`
- `config`
- `chat.message`
- `chat.params`
- `chat.headers`
- `event`
- `tool.execute.before`
- `tool.execute.after`
- `experimental.chat.messages.transform`
- `experimental.chat.system.transform`

## NOTES

- `src/testing/` exists but is currently empty in this checkout.
- Use child AGENTS files for domain rules; keep this file focused on source-root navigation.
