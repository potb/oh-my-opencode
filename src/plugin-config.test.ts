import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as shared from "./shared"
import { type OhMyOpenCodeConfig } from "./config";

const tempDirs: string[] = []

async function importFreshPluginConfigModule(): Promise<typeof import("./plugin-config")> {
  return import(`./plugin-config?test=${Date.now()}-${Math.random()}`)
}

afterEach(() => {
  mock.restore()

  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe("loadPluginConfig", () => {
  it("should ignore edits to the renamed legacy backup after migration", async () => {
    // given
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-legacy-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")
    const legacyConfigPath = join(projectConfigDir, "oh-my-opencode.jsonc")
    const backupConfigPath = `${legacyConfigPath}.bak`
    const canonicalConfigPath = join(projectConfigDir, "oh-my-openagent.jsonc")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })
    writeFileSync(legacyConfigPath, JSON.stringify({ agents: { oracle: { model: "openai/gpt-5.4" } } }))

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    // when
    const { loadPluginConfig } = await importFreshPluginConfigModule()
    loadPluginConfig(projectDir, {})
    writeFileSync(backupConfigPath, JSON.stringify({ agents: { oracle: { model: "openai/gpt-5-nano" } } }))
    const reloadedConfig = loadPluginConfig(projectDir, {})

    // then
    expect(existsSync(legacyConfigPath)).toBe(false)
    expect(existsSync(backupConfigPath)).toBe(true)
    expect(readFileSync(canonicalConfigPath, "utf-8")).toContain('"openai/gpt-5.4"')
    expect(reloadedConfig.agents?.oracle?.model).toBe("openai/gpt-5.4")
  })

  it("should still load config from legacy path when migration fails", async () => {
    // given - legacy config exists but canonical path is not writable
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-fail-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")
    const legacyConfigPath = join(projectConfigDir, "oh-my-opencode.json")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })
    writeFileSync(legacyConfigPath, JSON.stringify({ agents: { oracle: { model: "openai/gpt-5.4" } } }))

    // Make the directory read-only so migration write fails
    // (simulates Windows file lock / permission issues)
    if (process.platform !== "win32") {
      chmodSync(projectConfigDir, 0o555)
    }

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    // when
    let config: OhMyOpenCodeConfig
    try {
      const fresh = await importFreshPluginConfigModule()
      config = fresh.loadPluginConfig(projectDir, {})
    } finally {
      // Restore permissions for cleanup
      if (process.platform !== "win32") {
        chmodSync(projectConfigDir, 0o755)
      }
    }

    // then - should still load the config from legacy path
    expect(config.agents?.oracle?.model).toBe("openai/gpt-5.4")
  })

  it("should load migrated legacy project config on the first load", async () => {
    // given
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-first-load-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")
    const legacyConfigPath = join(projectConfigDir, "oh-my-opencode.jsonc")
    const canonicalConfigPath = join(projectConfigDir, "oh-my-openagent.jsonc")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })
    writeFileSync(legacyConfigPath, JSON.stringify({ agents: { oracle: { model: "openai/gpt-5.4" } } }))

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    // when
    const { loadPluginConfig } = await importFreshPluginConfigModule()
    const config = loadPluginConfig(projectDir, {})

    // then
    expect(existsSync(legacyConfigPath)).toBe(false)
    expect(existsSync(canonicalConfigPath)).toBe(true)
    expect(config.agents?.oracle?.model).toBe("openai/gpt-5.4")
  })

  it("should preserve explicit user git_master settings when project config omits git_master", async () => {
    // given
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-git-master-user-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })

    writeFileSync(
      join(userConfigDir, "oh-my-openagent.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: false,
          include_co_authored_by: false,
        },
      })
    )

    writeFileSync(
      join(projectConfigDir, "oh-my-openagent.jsonc"),
      JSON.stringify({
        agents: {
          oracle: { model: "anthropic/claude-opus-4-6" },
        },
      })
    )

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    // when
    const { loadPluginConfig } = await importFreshPluginConfigModule()
    const config = loadPluginConfig(projectDir, {})

    // then
    expect(config.git_master).toEqual({
      commit_footer: false,
      include_co_authored_by: false,
      git_env_prefix: "GIT_MASTER=1",
    })
  })

  it("should merge explicit git_master keys from user and project configs", async () => {
    // given
    const rootDir = mkdtempSync(join(tmpdir(), "omo-plugin-config-git-master-merge-"))
    const userConfigDir = join(rootDir, "user-config")
    const projectDir = join(rootDir, "project")
    const projectConfigDir = join(projectDir, ".opencode")

    tempDirs.push(rootDir)
    mkdirSync(userConfigDir, { recursive: true })
    mkdirSync(projectConfigDir, { recursive: true })

    writeFileSync(
      join(userConfigDir, "oh-my-openagent.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: false,
          include_co_authored_by: false,
        },
      })
    )

    writeFileSync(
      join(projectConfigDir, "oh-my-openagent.jsonc"),
      JSON.stringify({
        git_master: {
          commit_footer: true,
        },
      })
    )

    process.env.OPENCODE_CONFIG_DIR = userConfigDir

    // when
    const { loadPluginConfig } = await importFreshPluginConfigModule()
    const config = loadPluginConfig(projectDir, {})

    // then
    expect(config.git_master).toEqual({
      commit_footer: true,
      include_co_authored_by: false,
      git_env_prefix: "GIT_MASTER=1",
    })
  })
})
