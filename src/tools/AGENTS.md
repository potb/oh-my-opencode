# src/tools/ - Tool Factories

**Generated:** 2026-04-11

## OVERVIEW

Tool factories and direct definitions used by the trimmed plugin tool surface.

## TOOL CATALOG

### Delegation (1)

| Tool | Factory | Parameters |
|------|---------|------------|
| `task` | `createDelegateTask` | description, prompt, subagent_type, run_in_background, session_id, command |

Category-based routing is removed in the fixed-product runtime. Use direct `subagent_type` delegation.

### Agent Invocation (1)

| Tool | Factory | Parameters |
|------|---------|------------|

### LSP Refactoring (6) - Direct ToolDefinition

| Tool | Parameters |
|------|------------|
| `lsp_goto_definition` | filePath, line, character |
| `lsp_find_references` | filePath, line, character, includeDeclaration |
| `lsp_symbols` | filePath, scope (document/workspace), query, limit |
| `lsp_diagnostics` | filePath, severity |
| `lsp_prepare_rename` | filePath, line, character |
| `lsp_rename` | filePath, line, character, newName |

### Code Search (4)

| Tool | Factory | Parameters |
|------|---------|------------|
| `ast_grep_search` | `createAstGrepTools` | pattern, lang, paths, globs, context |
| `ast_grep_replace` | `createAstGrepTools` | pattern, rewrite, lang, paths, globs, dryRun |
| `grep` | `createGrepTools` | pattern, path, include (60s timeout, 10MB limit) |
| `glob` | `createGlobTools` | pattern, path (60s timeout, 100 file limit) |

### Task Tracking

Task tracking is handled by the active todo/task hooks and current fixed-product runtime conventions, not by a standalone task_create/task_update tool surface.

### System (2)

| Tool | Factory | Parameters |
|------|---------|------------|
| `interactive_bash` | Direct | tmux_command |
| `look_at` | `createLookAt` | file_path, image_data, goal |

### Editing (1) - Conditional

| Tool | Factory | Parameters |
|------|---------|------------|
| `hashline_edit` | `createHashlineEditTool` | file, edits[] |

## DELEGATION

The fixed-product runtime delegates through explicit `subagent_type` values such as `explore`, `librarian`, `oracle`, and `plan`.

## HOW TO ADD A TOOL

1. Create `src/tools/{name}/index.ts` exporting factory
2. Create `src/tools/{name}/types.ts` for parameter schemas
3. Create `src/tools/{name}/tools.ts` for implementation
4. Register in `src/plugin/tool-registry.ts`
