# src/ — Plugin Source Root

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Bootstrap layer plus root-level wiring that ties together agents, config, features, hooks, plugin glue, shared infrastructure, and tools.

Publishable packages in `../packages/*` are thin OpenCode plugin entry adapters over this source tree.

## INITIALIZATION PATH

```text
index.ts
  → plugin-config.ts
  → create-managers.ts
  → create-tools.ts
  → create-hooks.ts
  → plugin-interface.ts
  → plugin-dispose.ts (cleanup)
```

## ROOT FILES

| File | Purpose |
|------|---------|
| `index.ts` | Exports `OhMyOpenCodePlugin`; wires factories |
| `plugin-config.ts` | Sole source of truth for runtime config values (`PLUGIN_CONFIG`) |
| `create-managers.ts` | `BackgroundManager` + runtime config hook factory |
| `create-tools.ts` | Calls `createToolRegistry()` |
| `create-hooks.ts` | Delegates to `plugin/hooks/create-core-hooks.ts` |
| `plugin-interface.ts` | Exposes the 10 OpenCode hook surfaces |
| `plugin-state.ts` | Model cache state helpers |
| `plugin-dispose.ts` | Plugin teardown, manager cleanup |
| `fixed-product.ts` | Fixed-product agent name removals/overrides |

## PACKAGE ADAPTERS

| Package | Source dependency |
|---------|-------------------|
| `packages/oh-my-opencode` | `src/index.ts` full plugin |
| `packages/opencode-task-delegation` | `plugin-config.ts`, `features/background-agent/`, `tools/delegate-task/` |
| `packages/opencode-lsp-tools` | `tools/lsp/tools.ts`, `tools/lsp/client.ts` |

## SUBDIRECTORIES

| Directory | Role |
|-----------|------|
| `agents/` | Agent factories, prompts, model routing |
| `config/` | TypeScript config types (no runtime loading) |
| `features/` | Background-task engine, builtin skills |
| `generated/` | Generated artifacts committed into source |
| `hooks/` | Per-domain hook factories |
| `plugin/` | Hook handlers, composition glue, runtime overrides |
| `shared/` | Cross-cutting helpers (logger, model resolution, sessions) |
| `testing/` | Reserved (currently empty) |
| `tools/` | Tool family factories + LSP tools |

## CONVENTIONS

- Edit `plugin-config.ts` for runtime values; do NOT spread config across modules
- Keep `index.ts` to factory wiring only — never put domain logic here
- Keep package wrappers thin; implementation ownership remains in `src/` until explicitly extracted
- New top-level concerns get their own subdirectory; do not flatten into root files

## NOTES

- `src/testing/` exists empty — do not document as a live module
- `src/generated/` holds committed schema artifacts; do not hand-edit
