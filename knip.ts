import type { KnipConfig } from "knip"

const config: KnipConfig = {
  entry: [
    "tests/**/*.ts",
  ],
  ignoreIssues: {
    "src/shared/connected-providers-cache.ts": ["exports"],
    "src/shared/zip-entry-listing/tar-zip-entry-listing.ts": ["exports"],
    "src/tools/delegate-task/timing.ts": ["exports"],
    "src/features/background-agent/test-config.ts": ["files"],
  },
  project: [
    "src/**/*.ts!",
    "tests/**/*.ts",
  ],
}

export default config
