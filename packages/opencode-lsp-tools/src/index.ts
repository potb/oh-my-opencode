import type { Plugin, ToolDefinition } from "@opencode-ai/plugin"

import {
  lsp_diagnostics,
  lsp_find_references,
  lsp_goto_definition,
  lsp_prepare_rename,
  lsp_rename,
  lsp_symbols,
} from "../../../src/tools/lsp/tools"
import { lspManager } from "../../../src/tools/lsp/client"

const lspTools: Record<string, ToolDefinition> = {
  lsp_goto_definition,
  lsp_find_references,
  lsp_symbols,
  lsp_diagnostics,
  lsp_prepare_rename,
  lsp_rename,
}

const LspToolsPlugin: Plugin = async () => ({
  name: "opencode-lsp-tools",
  tool: lspTools,
  event: async (input: { event: { type: string } }): Promise<void> => {
    if (input.event.type === "session.deleted") {
      await lspManager.cleanupTempDirectoryClients()
    }
  },
})

export default LspToolsPlugin
