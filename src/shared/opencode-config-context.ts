import { detectPluginConfigFile } from "./jsonc-parser"
import { getOpenCodeConfigPaths } from "./opencode-config-dir"
import type {
  OpenCodeBinaryType,
  OpenCodeConfigPaths,
} from "./opencode-config-dir-types"

interface ConfigContext {
  binary: OpenCodeBinaryType
  version: string | null
  paths: OpenCodeConfigPaths
}

let configContext: ConfigContext | null = null

export function initConfigContext(binary: OpenCodeBinaryType, version: string | null): void {
  const paths = getOpenCodeConfigPaths({ binary, version })
  configContext = { binary, version, paths }
}

function getConfigContext(): ConfigContext {
  if (!configContext) {
    const paths = getOpenCodeConfigPaths({ binary: "opencode", version: null })
    configContext = { binary: "opencode", version: null, paths }
  }

  return configContext
}

function resetConfigContext(): void {
  configContext = null
}

function getConfigDir(): string {
  return getConfigContext().paths.configDir
}

function getOmoConfigPath(): string {
  const configDir = getConfigContext().paths.configDir
  const detected = detectPluginConfigFile(configDir)
  if (detected.format !== "none") return detected.path
  return getConfigContext().paths.omoConfig
}
