# packages/opencode-lsp-tools — LSP Tools Plugin

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Standalone OpenCode plugin exposing the six custom LSP tools backed by the root LSP client stack.

## ENTRYPOINT

| File | Role |
|------|------|
| `src/index.ts` | Registers six `lsp_*` tool definitions and session-deleted cleanup |
| `package.json` | Package name `opencode-lsp-tools`; root export points to `dist/index.{js,d.ts}` |

## TOOL SURFACE

`lsp_goto_definition`, `lsp_find_references`, `lsp_symbols`, `lsp_diagnostics`, `lsp_prepare_rename`, `lsp_rename`.

## INTERNAL DEPENDENCIES

| Root source | Use |
|-------------|-----|
| `src/tools/lsp/tools.ts` | Tool definitions |
| `src/tools/lsp/client.ts` | Shared `lspManager` cleanup |

## CONTRACTS

- Expose only LSP tools.
- Keep protocol/server implementation documented in `src/tools/lsp/AGENTS.md`.
- On `session.deleted`, call `lspManager.cleanupTempDirectoryClients()`.

## ANTI-PATTERNS

- Spawning LSP processes from the package wrapper.
- Adding non-LSP tools to this package.
- Forking LSP tool definitions instead of importing root source.
