import {
  lsp_goto_definition,
  lsp_find_references,
  lsp_symbols,
  lsp_diagnostics,
  lsp_prepare_rename,
  lsp_rename,
  lspManager,
} from "./lsp"
import type { ToolDefinition } from "@opencode-ai/plugin"

export { lspManager }

export { createAstGrepTools } from "./ast-grep"
export { createGrepTools } from "./grep"
export { createGlobTools } from "./glob"

export { createDelegateTask } from "./delegate-task"
export { createHashlineEditTool } from "./hashline-edit"

export const builtinTools: Record<string, ToolDefinition> = {
  lsp_goto_definition,
  lsp_find_references,
  lsp_symbols,
  lsp_diagnostics,
  lsp_prepare_rename,
  lsp_rename,
}
