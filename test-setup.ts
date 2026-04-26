import { afterEach, beforeEach, mock } from "bun:test"
import { rmSync } from "node:fs"
import { _resetMemCacheForTesting as resetConnectedProvidersCache } from "./src/shared/connected-providers-cache"
import { getOmoOpenCodeCacheDir } from "./src/shared/data-path"
import { resetMainSessionIDForTesting } from "./src/shared/main-session-id"
import { resetSubagentSessionsForTesting } from "./src/shared/subagent-session-registry"
import { installModuleMockLifecycle } from "./tests/module-mock-lifecycle"

const { restoreModuleMocks } = installModuleMockLifecycle(mock)
let environmentSnapshot: NodeJS.ProcessEnv = { ...process.env }
let workingDirectorySnapshot = process.cwd()

function cleanupOmoCacheDir(cacheDir: string): void {
  rmSync(cacheDir, { recursive: true, force: true })
}

beforeEach(() => {
  environmentSnapshot = { ...process.env }
  workingDirectorySnapshot = process.cwd()
  cleanupOmoCacheDir(getOmoOpenCodeCacheDir())
  resetMainSessionIDForTesting()
  resetSubagentSessionsForTesting()
  resetConnectedProvidersCache()
})

afterEach(() => {
  const currentCacheDir = getOmoOpenCodeCacheDir()

  for (const key of Object.keys(process.env)) {
    if (!(key in environmentSnapshot)) {
      delete process.env[key]
    }
  }

  for (const [key, value] of Object.entries(environmentSnapshot)) {
    if (value === undefined) {
      delete process.env[key]
      continue
    }

    process.env[key] = value
  }

  if (process.cwd() !== workingDirectorySnapshot) {
    process.chdir(workingDirectorySnapshot)
  }

  cleanupOmoCacheDir(currentCacheDir)
  cleanupOmoCacheDir(getOmoOpenCodeCacheDir())
  resetConnectedProvidersCache()
  mock.restore()
  restoreModuleMocks()
})
