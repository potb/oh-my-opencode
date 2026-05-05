# src/tools/lsp/ — LSP Tool Implementations

**Generated:** 2026-05-06 | **Commit:** 10ae7625

## OVERVIEW

Custom Language Server Protocol client stack exposed as 6 tools. Owns its own process / transport / client implementation; does not delegate to OpenCode's built-in LSP surface.

Also consumed by `packages/opencode-lsp-tools`, which exposes only these six tools as a standalone OpenCode plugin.

## TOOL EXPOSURE

| Tool | File | Purpose |
|------|------|---------|
| `lsp_goto_definition` | `goto-definition-tool.ts` | Jump to symbol definition |
| `lsp_find_references` | `find-references-tool.ts` | All workspace usages |
| `lsp_symbols` | `symbols-tool.ts` | Document outline / workspace symbol search |
| `lsp_diagnostics` | `diagnostics-tool.ts` | Errors / warnings from server |
| `lsp_prepare_rename` | `rename-tools.ts` | Validate rename feasibility |
| `lsp_rename` | `rename-tools.ts` | Apply workspace-wide rename |

All exported as direct `ToolDefinition` objects from `tools.ts` (not factories) — registered directly in `src/plugin/tool-registry.ts`.

The package wrapper imports the same definitions from `tools.ts` and `lspManager` from `client.ts`; it does not fork protocol logic.

## ARCHITECTURE

```text
tools.ts (6 ToolDefinition exports)
  ↓
LspClientWrapper (lsp-client-wrapper.ts)
  ↓
LSPClient (lsp-client.ts) extends LSPClientConnection (lsp-client-connection.ts)
  ↓ JSON-RPC
LSPClientTransport (lsp-client-transport.ts)
  ↓ stdio
LSPProcess (lsp-process.ts) — spawned server binary
```

## KEY FILES

| File | Purpose |
|------|---------|
| `lsp-client-wrapper.ts` | High-level entry; resolve server, open file, run request |
| `lsp-client.ts`, `lsp-client-connection.ts`, `lsp-client-transport.ts` | Client + JSON-RPC + stdio framing |
| `lsp-process.ts` | Spawn / cleanup of LSP server process |
| `lsp-manager-process-cleanup.ts` | Reap orphan LSP processes on exit |
| `lsp-manager-temp-directory-cleanup.ts` | Clean temp dirs used by some servers |
| `lsp-server.ts` | Manager-level server orchestration |
| `server-definitions.ts`, `server-config-loader.ts` | Builtin server catalog |
| `server-resolution.ts` | Pick server for a file based on extension |
| `server-installation.ts` | Detect missing binaries, surface install hints |
| `server-path-bases.ts` | Server install path bases |
| `language-mappings.ts`, `infer-extension.ts` | Extension / language-id mapping |
| `language-config.ts` | Per-language settings |
| `directory-diagnostics.ts` | Multi-file diagnostics for directory targets |
| `lsp-formatters.ts` | Format LSP responses to human-readable strings |
| `workspace-edit.ts` | Apply `WorkspaceEdit` to disk (rename) |
| `client.ts`, `config.ts` | Client + config glue |
| `constants.ts`, `types.ts` | Constants + LSP data shapes |

```text
file.ts → extension (.ts) → language-mappings → server id (typescript)
  → server-resolution: match in server-definitions
  → server-installation: verify binary + surface install hint if missing
  → LSPProcess.spawn(command[])
```

## CONTRACTS

- File MUST be opened via `didOpen` before any LSP request — `LSPClient.openFile()` handles this
- 1s delay after `didOpen` for server initialization before sending the first request
- Server catalog is synced from OpenCode's `server.ts` — when adding servers, check upstream first
- All process spawns must register with `lspManager` cleanup so exits free orphans

## ANTI-PATTERNS

- Skipping `didOpen` and sending requests on a cold file
- Spawning LSP processes outside `lsp-process.ts`
- Letting `tools.ts` grow domain logic — keep tool exports thin, push behavior to wrapper / client
