/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { AGENT_NAME_MAP, migrateAgentNames } from "./agent-names"

describe("AGENT_NAME_MAP parenthesized aliases", () => {
  test("maps Sisyphus (Ultraworker) to sisyphus", () => {
    // given
    const alias = "Sisyphus (Ultraworker)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("sisyphus")
  })

  test("maps Metis (Plan Consultant) to metis", () => {
    // given
    const alias = "Metis (Plan Consultant)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("metis")
  })

  test("maps Momus (Plan Critic) to momus", () => {
    // given
    const alias = "Momus (Plan Critic)"

    // when
    const result = AGENT_NAME_MAP[alias]

    // then
    expect(result).toBe("momus")
  })
})

describe("migrateAgentNames with parenthesized aliases", () => {
  test("migrates supported parenthesized aliases to canonical names", () => {
    // given
    const legacyAgents = {
      "Sisyphus (Ultraworker)": { model: "claude-opus-4" },
      "Metis (Plan Consultant)": { model: "claude-opus-4" },
      "Momus (Plan Critic)": { model: "claude-opus-4" },
    }

    // when
    const { migrated, changed } = migrateAgentNames(legacyAgents)

    // then
    expect(changed).toBe(true)
    expect(migrated.sisyphus).toEqual({ model: "claude-opus-4" })
    expect(migrated.metis).toEqual({ model: "claude-opus-4" })
    expect(migrated.momus).toEqual({ model: "claude-opus-4" })
    expect(migrated["Sisyphus (Ultraworker)"]).toBeUndefined()
  })

  test("passes through removed agent names unchanged", () => {
    // given
    const agents = {
      "Removed Agent (Legacy)": { model: "gpt-5.4" },
    }

    // when
    const { migrated, changed } = migrateAgentNames(agents)

    // then - no alias mapping, keys pass through as-is
    expect(changed).toBe(false)
    expect(migrated["Removed Agent (Legacy)"]).toEqual({ model: "gpt-5.4" })
  })
})
