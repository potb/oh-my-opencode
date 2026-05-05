import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignoreDependencies: [
    "@ast-grep/cli",
    "oh-my-opencode",
    "opencode-lsp-tools",
    "opencode-task-delegation",
    "vscode-jsonrpc",
  ],
  ignoreIssues: {
    "src/shared/connected-providers-cache.ts": ["exports"],
    "src/shared/zip-entry-listing/tar-zip-entry-listing.ts": ["exports"],
    "src/tools/delegate-task/timing.ts": ["exports"],
    "src/features/background-agent/test-config.ts": ["files"],
    "bun-test.d.ts": ["files"],
  },
  workspaces: {
    ".": {
      entry: ["tests/**/*.ts"],
      project: [
        "src/**/*.ts!",
        "tests/**/*.ts",
        "bun-test.d.ts",
      ],
    },
    "packages/oh-my-opencode": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/opencode-task-delegation": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/opencode-lsp-tools": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
  },
}

export default config
