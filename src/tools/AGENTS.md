# src/tools/ — Tool Families

**Generated:** 2026-04-25 | **Commit:** 20a49686

## OVERVIEW

Owns plugin tool factories plus direct LSP tool definitions. The major families are delegation, search, and custom LSP.

## STRUCTURE

```text
tools/
├── delegate-task/  # Subagent delegation engine
├── lsp/            # Custom LSP client + 6 tools
├── ast-grep/       # AST-aware pattern search/replace
├── grep/           # Content search wrapper
├── glob/           # File pattern matching wrapper
├── shared/         # Tool-local helpers
└── index.ts        # Exports factories + builtin LSP tools
```

## TOOL MAP

| Family | Entry | Notes |
|--------|------|-------|
| Delegation | `createDelegateTask` | Routes sync/background subagent work |
| Search | `createAstGrepTools`, `createGrepTools`, `createGlobTools` | Literal, AST, and file-pattern search |
| LSP | `lsp_*` exports from `lsp/` | Direct `ToolDefinition`s plus `lspManager` |

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Delegation behavior | `delegate-task/` | Background vs sync execution, prompt building, model selection |
| Search tool implementation | `ast-grep/`, `grep/`, `glob/` | Separate wrappers, parent guide is enough for now |
| LSP transport stack | `lsp/` | Custom process/client/transport implementation |

## CONVENTIONS

- Keep `index.ts` limited to exports and builtin tool maps.
- Treat each family as an ownership boundary; put family-specific docs in child AGENTS files where they exist.
- Prefer adding new tool families as dedicated subdirs, not as loose files in `tools/` root.

## ANTI-PATTERNS

- Do not put implementation logic in `tool-registry.ts`; this tree owns tool behavior.
- Do not create synthetic grouping directories just for docs when existing family dirs already express ownership.
