import { describe, it, expect } from "bun:test"
import { writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { getMergedServers } from "./server-config-loader"

describe("getMergedServers", () => {
  it("discovers JSONC-only user config (oh-my-opencode.jsonc)", () => {
    const originalEnv = process.env.OPENCODE_CONFIG_DIR
    const tempBase = join(tmpdir(), `omo-test-user-jsonc-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    try {
      mkdirSync(tempBase, { recursive: true })
      process.env.OPENCODE_CONFIG_DIR = tempBase

      const userJsonc = `{
  // user jsonc config
  "lsp": {
    "user-jsonc": {
      "command": ["user-jsonc-cmd"],
      "extensions": [".ujs"]
    }
  }
}`
      const userPath = join(tempBase, "oh-my-opencode.jsonc")
      writeFileSync(userPath, userJsonc, "utf-8")

      const servers = getMergedServers()
      const found = servers.find(s => s.id === "user-jsonc" && s.source === "user")
      expect(found !== undefined).toBe(true)
    } finally {
      if (originalEnv === undefined) delete process.env.OPENCODE_CONFIG_DIR
      else process.env.OPENCODE_CONFIG_DIR = originalEnv
      rmSync(tempBase, { recursive: true, force: true })
    }
  })

  it("discovers JSONC-only project config (.opencode/oh-my-opencode.jsonc)", () => {
    const originalCwd = process.cwd()
    const tempProject = join(tmpdir(), `omo-test-project-jsonc-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    try {
      mkdirSync(join(tempProject, ".opencode"), { recursive: true })
      const projectJsonc = `{
  // project jsonc config
  "lsp": {
    "project-jsonc": {
      "command": ["project-jsonc-cmd"],
      "extensions": [".pjs"]
    }
  }
}`
      const projectPath = join(tempProject, ".opencode", "oh-my-opencode.jsonc")
      writeFileSync(projectPath, projectJsonc, "utf-8")

      process.chdir(tempProject)
      const servers = getMergedServers()
      const found = servers.find(s => s.id === "project-jsonc" && s.source === "project")
      expect(found !== undefined).toBe(true)
    } finally {
      process.chdir(originalCwd)
      rmSync(tempProject, { recursive: true, force: true })
    }
  })

  it("ignores .json and only loads .jsonc for plugin config", () => {
    const originalEnv = process.env.OPENCODE_CONFIG_DIR
    const tempBase = join(tmpdir(), `omo-test-precedence-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    try {
      mkdirSync(tempBase, { recursive: true })
      process.env.OPENCODE_CONFIG_DIR = tempBase

      const jsonContent = `{
  "lsp": {
    "conflict": {
      "command": ["from-json"],
      "extensions": [".j"]
    }
  }
}`
      const jsoncContent = `{
  // jsonc should take precedence
  "lsp": {
    "conflict": {
      "command": ["from-jsonc"],
      "extensions": [".jc"]
    }
  }
}`
      writeFileSync(join(tempBase, "oh-my-opencode.json"), jsonContent, "utf-8")
      writeFileSync(join(tempBase, "oh-my-opencode.jsonc"), jsoncContent, "utf-8")

      const servers = getMergedServers()
      const found = servers.find(s => s.id === "conflict" && s.source === "user")
      expect(found?.command && Array.isArray(found.command) && found.command[0] === "from-jsonc").toBe(true)
    } finally {
      if (originalEnv === undefined) delete process.env.OPENCODE_CONFIG_DIR
      else process.env.OPENCODE_CONFIG_DIR = originalEnv
      rmSync(tempBase, { recursive: true, force: true })
    }
  })
})
