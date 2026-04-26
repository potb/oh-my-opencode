# src/tools/lsp/ — LSP Tool Implementations

**Generated:** 2026-04-26 | **Commit:** 5d62e3bf

## OVERVIEW

Full LSP (Language Server Protocol) client stack exposed as 6 tools. This subtree owns the custom server/process/client implementation and does not delegate to OpenCode's built-in LSP surface.

## TOOL EXPOSURE

| Tool | File | What It Does |
|------|------|--------------|
| `lsp_goto_definition` | `goto-definition-tool.ts` | Jump to symbol definition |
| `lsp_find_references` | `find-references-tool.ts` | All usages of a symbol |
| `lsp_symbols` | `symbols-tool.ts` | Document outline or workspace symbol search |
| `lsp_diagnostics` | `diagnostics-tool.ts` | Errors/warnings from language server |
| `lsp_prepare_rename` | `rename-tools.ts` | Validate rename before applying |
| `lsp_rename` | `rename-tools.ts` | Apply safe rename across workspace |

All 6 are direct `ToolDefinition` objects (not factory functions) — registered directly in `tool-registry.ts`.

## ARCHITECTURE

```
tools.ts (6 ToolDefinition exports)
  ↓ uses
LspClientWrapper (lsp-client-wrapper.ts)
  ↓ wraps
LSPClient (lsp-client.ts) extends LSPClientConnection (lsp-client-connection.ts)
  ↓ communicates via
LSPClientTransport (lsp-client-transport.ts)
  ↓ talks to
LSPProcess (lsp-process.ts) — spawns server binary
```

## KEY FILES

| File | Purpose |
|------|---------|
| `lsp-client-wrapper.ts` | High-level entry: resolves server, opens file, runs request |
| `lsp-client.ts` | `LSPClient` — file tracking, document sync (`didOpen`/`didChange`) |
| `lsp-client-connection.ts` | JSON-RPC request/response/notification layer |
| `lsp-client-transport.ts` | stdin/stdout byte-stream framing |
| `lsp-process.ts` | Spawn + cleanup of LSP server process |
| `lsp-manager-process-cleanup.ts` | Reap orphan LSP processes on exit |
| `lsp-manager-temp-directory-cleanup.ts` | Clean temp dirs used by some servers |
| `server-definitions.ts` | Builtin server catalog synced from OpenCode's `server.ts` |
| `server-config-loader.ts` | Merge builtin server definitions for resolution |
| `server-resolution.ts` | Resolve which server handles a file extension |
| `server-installation.ts` | Detect missing binaries, surface install hints |
| `language-mappings.ts` | Extension → language ID mapping |
| `lsp-formatters.ts` | Format LSP responses into human-readable strings |
| `workspace-edit.ts` | Apply `WorkspaceEdit` results to disk (for rename) |
| `types.ts` | `LSPServerConfig`, `Position`, `Range`, `Location`, `Diagnostic` etc. |

## SERVER RESOLUTION

```
file.ts → extension (.ts) → language-mappings → server ID (typescript)
  → server-resolution: check server-definitions.ts for builtin server matches
  → server-installation: verify binary exists (warn with install hint if not)
  → LSPProcess.spawn(command[])
```

## NOTES

- File must be opened via `didOpen` before any LSP request — `LSPClient.openFile()` handles this
- 1s delay after `didOpen` for server initialization before sending requests
- Synced with OpenCode's `server.ts` — when adding servers, check upstream first
