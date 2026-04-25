import { existsSync } from "node:fs"
import { join } from "node:path"
import { getDataDir } from "./data-path"
import { isOpenCodeVersionAtLeast, OPENCODE_SQLITE_VERSION } from "./opencode-version"

const NOT_CACHED = Symbol("NOT_CACHED")
let cachedResult: true | false | typeof NOT_CACHED = NOT_CACHED

export function isSqliteBackend(): boolean {
  if (cachedResult === true) return true
  if (cachedResult === false) return false

  const check = (): boolean => {
    const versionOk = isOpenCodeVersionAtLeast(OPENCODE_SQLITE_VERSION)
    const dbPath = join(getDataDir(), "opencode", "opencode.db")
    return versionOk && existsSync(dbPath)
  }

  const result = check()
  cachedResult = result
  return result
}

function resetSqliteBackendCache(): void {
  cachedResult = NOT_CACHED
}
