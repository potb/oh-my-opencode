/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import {
  ExperimentalConfigSchema,
  GitMasterConfigSchema,
  OhMyOpenCodeConfigSchema,
} from "./schema"

describe("OhMyOpenCodeConfigSchema unknown fields", () => {
  test("rejects unknown top-level config fields", () => {
    const result = OhMyOpenCodeConfigSchema.safeParse({
      unknown_field: true,
    })

    expect(result.success).toBe(false)
  })

  test("rejects multiple unknown top-level config fields", () => {
    const result = OhMyOpenCodeConfigSchema.safeParse({
      unknown_field_a: true,
      unknown_field_b: { enabled: true },
    })

    expect(result.success).toBe(false)
  })
})

describe("Sisyphus-Junior agent override", () => {
  test("schema accepts agents['Sisyphus-Junior'] override fields after strict cleanup", () => {
    // given
    const config = {
      agents: {
        "sisyphus-junior": {
          temperature: 0.2,
        },
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agents?.["sisyphus-junior"]).toBeDefined()
      expect(result.data.agents?.["sisyphus-junior"]?.temperature).toBe(0.2)
    }
  })

  test("schema accepts sisyphus-junior with prompt_append", () => {
    // given
    const config = {
      agents: {
        "sisyphus-junior": {
          prompt_append: "Additional instructions for sisyphus-junior",
        },
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agents?.["sisyphus-junior"]?.prompt_append).toBe(
        "Additional instructions for sisyphus-junior"
      )
    }
  })

  test("schema accepts lowercase agent names (sisyphus, metis)", () => {
    // given
    const config = {
      agents: {
        sisyphus: {
          temperature: 0.1,
        },
        metis: {
          temperature: 0.3,
        },
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agents?.sisyphus?.temperature).toBe(0.1)
      expect(result.data.agents?.metis?.temperature).toBe(0.3)
    }
  })

  test("schema accepts lowercase metis and momus agent names", () => {
    // given
    const config = {
      agents: {
        metis: {
          category: "ultrabrain",
        },
        momus: {
          category: "quick",
        },
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agents?.metis?.category).toBe("ultrabrain")
      expect(result.data.agents?.momus?.category).toBe("quick")
    }
  })
})

describe("OhMyOpenCodeConfigSchema - browser_automation_engine", () => {
  test("accepts browser_automation_engine config", () => {
    // given
    const input = {
      browser_automation_engine: {
        provider: "agent-browser",
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    // then
    expect(result.success).toBe(true)
    expect(result.data?.browser_automation_engine?.provider).toBe("agent-browser")
  })

  test("accepts config without browser_automation_engine", () => {
    // given
    const input = {}

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    // then
    expect(result.success).toBe(true)
    expect(result.data?.browser_automation_engine).toBeUndefined()
  })

  test("rejects browser_automation_engine with unsupported provider", () => {
    // given
    const input = { browser_automation_engine: { provider: "unsupported-provider" } }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    // then
    expect(result.success).toBe(false)
  })
})

describe("ExperimentalConfigSchema feature flags", () => {
  test("both fields are optional", () => {
    //#given
    const config = {}

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disable_omo_env).toBeUndefined()
    }
  })

  test("accepts disable_omo_env as true", () => {
    //#given
    const config = { disable_omo_env: true }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disable_omo_env).toBe(true)
    }
  })

  test("accepts disable_omo_env as false", () => {
    //#given
    const config = { disable_omo_env: false }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disable_omo_env).toBe(false)
    }
  })

  test("disable_omo_env is optional", () => {
    //#given
    const config = { max_tools: 50 }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disable_omo_env).toBeUndefined()
    }
  })

  test("rejects non-boolean disable_omo_env", () => {
    //#given
    const config = { disable_omo_env: "true" }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(false)
  })

})

describe("GitMasterConfigSchema", () => {
  test("accepts boolean true for commit_footer", () => {
    //#given
    const config = { commit_footer: true }

    //#when
    const result = GitMasterConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commit_footer).toBe(true)
    }
  })

  test("accepts boolean false for commit_footer", () => {
    //#given
    const config = { commit_footer: false }

    //#when
    const result = GitMasterConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commit_footer).toBe(false)
    }
  })

  test("accepts string value for commit_footer", () => {
    //#given
    const config = { commit_footer: "Custom footer text" }

    //#when
    const result = GitMasterConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commit_footer).toBe("Custom footer text")
    }
  })

  test("defaults commit_footer to true when not provided", () => {
    //#given
    const config = {}

    //#when
    const result = GitMasterConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commit_footer).toBe(true)
    }
  })

  test("rejects number for commit_footer", () => {
    //#given
    const config = { commit_footer: 123 }

    //#when
    const result = GitMasterConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(false)
  })

  test("accepts shell-safe git_env_prefix", () => {
    const config = { git_env_prefix: "MY_HOOK=active" }

    const result = GitMasterConfigSchema.safeParse(config)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.git_env_prefix).toBe("MY_HOOK=active")
    }
  })

  test("rejects git_env_prefix with shell metacharacters", () => {
    const config = { git_env_prefix: "A=1; rm -rf /" }

    const result = GitMasterConfigSchema.safeParse(config)

    expect(result.success).toBe(false)
  })
})

describe("OhMyOpenCodeConfigSchema - git_master defaults (#2040)", () => {
  test("git_master defaults are applied when section is missing from config", () => {
    //#given
    const config = {}

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.git_master).toBeDefined()
      expect(result.data.git_master.commit_footer).toBe(true)
      expect(result.data.git_master.include_co_authored_by).toBe(true)
      expect(result.data.git_master.git_env_prefix).toBe("GIT_MASTER=1")
    }
  })

  test("git_master respects explicit false values", () => {
    //#given
    const config = {
      git_master: {
        commit_footer: false,
        include_co_authored_by: false,
      },
    }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.git_master.commit_footer).toBe(false)
      expect(result.data.git_master.include_co_authored_by).toBe(false)
    }
  })
})

describe("skills schema", () => {
  test("rejects unknown skills configuration", () => {
    //#given
    const config = {
      skills: {
        custom: true,
      },
    }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(false)
  })
})
