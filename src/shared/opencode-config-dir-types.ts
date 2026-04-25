export type OpenCodeBinaryType = "opencode" | "opencode-desktop"

export type OpenCodeConfigDirOptions = {
  binary: OpenCodeBinaryType
  version?: string | null
  checkExisting?: boolean
}

export type OpenCodeConfigPaths = {
  configDir: string
  packageJson: string
  omoConfig: string
}
