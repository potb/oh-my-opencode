import { afterEach, describe, expect, it, mock, spyOn } from "bun:test"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import * as shared from "./shared"

const tempDirs: string[] = []

async function importFreshPluginConfigModule(): Promise<typeof import("./plugin-config")> {
  return import(`./plugin-config?test=${Date.now()}-${Math.random()}`)
}

afterEach(() => {
  mock.restore()
  delete process.env.OPENCODE_CONFIG_DIR

  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe("loadPluginConfig", () => {
  it("throws on invalid config instead of partially loading it", async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-invalid-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })
    writeFileSync(
      join(projectConfigDir, "oh-my-opencode.jsonc"),
      JSON.stringify({ disabled_hooks: [123] }),
    )

    process.env.OPENCODE_CONFIG_DIR = userConfigDir
    const addConfigLoadErrorSpy = spyOn(shared, "addConfigLoadError")

    const { loadPluginConfig } = await importFreshPluginConfigModule()

    await expect(async () => loadPluginConfig(projectDir, {})).toThrow(
      `Invalid config at ${join(projectConfigDir, "oh-my-opencode.jsonc")}: disabled_hooks.0: Invalid input: expected string, received number`,
    )
    expect(addConfigLoadErrorSpy).toHaveBeenCalled()
  })

  it("preserves explicit user git_master settings when project config omits git_master", async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-git-master-user-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })

    writeFileSync(
      join(userConfigDir, "oh-my-opencode.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: false,
          include_co_authored_by: false,
        },
      }),
    )

    writeFileSync(
      join(projectConfigDir, "oh-my-opencode.jsonc"),
      JSON.stringify({
        agents: {
          oracle: { temperature: 0.2 },
        },
      }),
    )

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    const { loadPluginConfig } = await importFreshPluginConfigModule()
    const config = loadPluginConfig(projectDir, {})

    expect(config.git_master).toEqual({
      commit_footer: false,
      include_co_authored_by: false,
      git_env_prefix: "GIT_MASTER=1",
    })
  })

  it("merges explicit git_master keys from user and project configs", async () => {
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-git-master-merge-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })

    writeFileSync(
      join(userConfigDir, "oh-my-opencode.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: false,
          include_co_authored_by: false,
        },
      }),
    )

    writeFileSync(
      join(projectConfigDir, "oh-my-opencode.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: true,
        },
      }),
    )

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    const { loadPluginConfig } = await importFreshPluginConfigModule()
    const config = loadPluginConfig(projectDir, {})

    expect(config.git_master).toEqual({
      commit_footer: true,
      include_co_authored_by: false,
      git_env_prefix: "GIT_MASTER=1",
    })
  })
})
