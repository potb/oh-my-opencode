# src/tools/ — Tool Families

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Tool factory families plus direct LSP tool definitions. Each family is an ownership boundary with its own internal docs where warranted.

Two package wrappers consume this tree: `packages/opencode-task-delegation` imports `delegate-task/`; `packages/opencode-lsp-tools` imports `lsp/`.

## STRUCTURE

```text
tools/
├── delegate-task/    # Subagent delegation engine (sync + background)
├── lsp/              # Custom LSP client + 6 LSP tools
├── ast-grep/         # AST-aware pattern search/replace (sg CLI wrapper)
├── grep/             # Content search wrapper
├── glob/             # File pattern matching wrapper
├── hashline-edit/    # Reserved (currently empty)
├── shared/           # Tool-local helpers (currently `semaphore.ts`)
└── index.ts          # Exports factories + builtin LSP tools
```

## TOOL MAP

| Family | Entry | Notes |
|--------|-------|-------|
| Delegation | `createDelegateTask` (`delegate-task/tools.ts`) | Routes sync vs background subagent work |
| AST search | `createAstGrepTools` (`ast-grep/tools.ts`) | Wraps `sg` CLI; handles binary download |
| Content search | `createGrepTools` (`grep/tools.ts`) | Ripgrep-style wrapper |
| File pattern | `createGlobTools` (`glob/tools.ts`) | Glob wrapper |
| LSP | `lsp_*` direct `ToolDefinition` exports (`lsp/tools.ts`) | Plus `lspManager` for cleanup |

## PACKAGE CONSUMERS

| Package | Imported surface |
|---------|------------------|
| `opencode-task-delegation` | `createDelegateTask()` plus `BackgroundManager` from `src/features/background-agent/` |
| `opencode-lsp-tools` | Six `lsp_*` definitions plus `lspManager` |

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Delegation behavior | `delegate-task/` (own AGENTS.md) |
| LSP transport stack | `lsp/` (own AGENTS.md) |
| AST-grep CLI binary handling | `ast-grep/cli-binary-path-resolution.ts`, `downloader.ts`, `sg-cli-path.ts` |
| Grep CLI binary handling | `grep/downloader.ts`, `cli.ts` |
| Glob result formatting | `glob/result-formatter.ts` |
| Tool concurrency primitive | `shared/semaphore.ts` |

## CONVENTIONS

- `index.ts` limited to exports + builtin tool maps — no implementation
- Each family owns its own contract; deeper docs live in family-specific AGENTS.md when warranted
- New tool families ship as dedicated subdirectories (no loose `tools/` root files)
- Package wrappers import tool surfaces; do not fork tool definitions under `packages/`

## ANTI-PATTERNS

- Putting tool implementation logic in `src/plugin/tool-registry.ts` (that's the registry boundary)
- Creating synthetic grouping directories just for docs when a family directory already expresses ownership
- Letting `shared/semaphore.ts` grow into a generic utility dump
