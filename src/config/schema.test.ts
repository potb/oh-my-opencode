/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import {
  ExperimentalConfigSchema,
  GitMasterConfigSchema,
  OhMyOpenCodeConfigSchema,
} from "./schema"

describe("disabled_mcps schema", () => {
  test("ignores disabled_mcps in the trimmed fixed-product schema", () => {
    const result = OhMyOpenCodeConfigSchema.safeParse({
      disabled_mcps: ["context7", "grep_app"],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>).disabled_mcps).toBeUndefined()
    }
  })
})

describe("OhMyOpenCodeConfigSchema trimmed fixed-product fields", () => {
  test("strips removed top-level config fields", () => {
    const result = OhMyOpenCodeConfigSchema.safeParse({
      auto_update: true,
      skills: ["frontend-ui-ux"],
      notification: { force_enable: true },
      model_capabilities: { enabled: true },
      babysitting: { timeout_ms: 1 },
      sisyphus_agent: { disabled: true },
    })

    expect(result.success).toBe(true)
    if (result.success) {
      const data = result.data as Record<string, unknown>
      expect(data.auto_update).toBeUndefined()
      expect(data.skills).toBeUndefined()
      expect(data.notification).toBeUndefined()
      expect(data.model_capabilities).toBeUndefined()
      expect(data.babysitting).toBeUndefined()
      expect(data.sisyphus_agent).toBeUndefined()
    }
  })
})

describe("Sisyphus-Junior agent override", () => {
  test("schema accepts agents['Sisyphus-Junior'] and retains the key after parsing", () => {
    // given
    const config = {
      agents: {
        "sisyphus-junior": {
          model: "openai/gpt-5.4",
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
      expect(result.data.agents?.["sisyphus-junior"]?.model).toBe("openai/gpt-5.4")
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

  test("schema accepts sisyphus-junior with tools override", () => {
    // given
    const config = {
      agents: {
        "sisyphus-junior": {
          tools: {
            read: true,
            write: false,
          },
        },
      },
    }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    // then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.agents?.["sisyphus-junior"]?.tools).toEqual({
        read: true,
        write: false,
      })
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

  test("rejects browser_automation_engine with removed provider", () => {
    // given
    const input = { browser_automation_engine: { provider: "playwright-cli" } }

    // when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    // then
    expect(result.success).toBe(false)
  })
})

describe("OhMyOpenCodeConfigSchema - hashline_edit", () => {
  test("accepts hashline_edit as true", () => {
    //#given
    const input = { hashline_edit: true }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    //#then
    expect(result.success).toBe(true)
    expect(result.data?.hashline_edit).toBe(true)
  })

  test("accepts hashline_edit as false", () => {
    //#given
    const input = { hashline_edit: false }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    //#then
    expect(result.success).toBe(true)
    expect(result.data?.hashline_edit).toBe(false)
  })

  test("hashline_edit is optional", () => {
    //#given
    const input = { experimental: { safe_hook_creation: true } }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    //#then
    expect(result.success).toBe(true)
    expect(result.data?.hashline_edit).toBeUndefined()
  })

  test("rejects non-boolean hashline_edit", () => {
    //#given
    const input = { hashline_edit: "true" }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(input)

    //#then
    expect(result.success).toBe(false)
  })
})

describe("ExperimentalConfigSchema feature flags", () => {
  test("accepts plugin_load_timeout_ms as number", () => {
    //#given
    const config = { plugin_load_timeout_ms: 5000 }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.plugin_load_timeout_ms).toBe(5000)
    }
  })

  test("rejects plugin_load_timeout_ms below 1000", () => {
    //#given
    const config = { plugin_load_timeout_ms: 500 }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(false)
  })

  test("accepts safe_hook_creation as boolean", () => {
    //#given
    const config = { safe_hook_creation: false }

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.safe_hook_creation).toBe(false)
    }
  })

  test("both fields are optional", () => {
    //#given
    const config = {}

    //#when
    const result = ExperimentalConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.plugin_load_timeout_ms).toBeUndefined()
      expect(result.data.safe_hook_creation).toBeUndefined()
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
    const config = { safe_hook_creation: true }

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
  test("accepts skills.sources configuration", () => {
    //#given
    const config = {
      skills: {
        sources: [{ path: "skill/", recursive: true }],
      },
    }

    //#when
    const result = OhMyOpenCodeConfigSchema.safeParse(config)

    //#then
    expect(result.success).toBe(true)
  })
})
