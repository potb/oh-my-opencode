import { existsSync, realpathSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve, win32 } from "node:path"

import type {
  OpenCodeBinaryType,
  OpenCodeConfigDirOptions,
  OpenCodeConfigPaths,
} from "./opencode-config-dir-types"

const TAURI_APP_IDENTIFIER = "ai.opencode.desktop"
const TAURI_APP_IDENTIFIER_DEV = "ai.opencode.desktop.dev"

function isDevBuild(version: string | null | undefined): boolean {
  if (!version) return false
  return version.includes("-dev") || version.includes(".dev")
}

function getTauriConfigDir(identifier: string): string {
  const platform = process.platform

  switch (platform) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", identifier)

    case "win32": {
      const appData = process.env.APPDATA || join(homedir(), "AppData", "Roaming")
      return win32.join(appData, identifier)
    }

    case "linux":
    default: {
      const xdgConfig = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
      return join(xdgConfig, identifier)
    }
  }
}

function resolveConfigPath(pathValue: string): string {
  const resolvedPath = resolve(pathValue)
  if (!existsSync(resolvedPath)) return resolvedPath

  try {
    return realpathSync(resolvedPath)
  } catch {
    return resolvedPath
  }
}

function getCliConfigDir(): string {
  const envConfigDir = process.env.OPENCODE_CONFIG_DIR?.trim()
  if (envConfigDir) {
    return resolveConfigPath(envConfigDir)
  }

  const xdgConfig = process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
  return resolveConfigPath(join(xdgConfig, "opencode"))
}

export function getOpenCodeConfigDir(options: OpenCodeConfigDirOptions): string {
  const { binary, version, checkExisting = true } = options

  if (binary === "opencode") {
    return getCliConfigDir()
  }

  const identifier = isDevBuild(version) ? TAURI_APP_IDENTIFIER_DEV : TAURI_APP_IDENTIFIER
  const tauriDirBase = getTauriConfigDir(identifier)
  const tauriDir = process.platform === "win32"
    ? (win32.isAbsolute(tauriDirBase) ? win32.normalize(tauriDirBase) : win32.resolve(tauriDirBase))
    : resolveConfigPath(tauriDirBase)

  void checkExisting

  return tauriDir
}

export function getOpenCodeConfigPaths(options: OpenCodeConfigDirOptions): OpenCodeConfigPaths {
  const configDir = getOpenCodeConfigDir(options)

  return {
    configDir,
    packageJson: join(configDir, "package.json"),
  }
}
