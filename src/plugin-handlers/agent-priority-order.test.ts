/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"

import {
  reorderAgentsByPriority,
  CANONICAL_CORE_AGENT_ORDER,
} from "./agent-priority-order"
import { getAgentDisplayName, getAgentListDisplayName } from "../shared/agent-display-names"

describe("agent-priority-order", () => {
  describe("CANONICAL_CORE_AGENT_ORDER", () => {
    test("exports canonical order as readonly array", () => {
      expect(CANONICAL_CORE_AGENT_ORDER).toBeDefined()
      expect(Array.isArray(CANONICAL_CORE_AGENT_ORDER)).toBe(true)
    })

    test("canonical order is exactly [sisyphus]", () => {
      expect(CANONICAL_CORE_AGENT_ORDER).toEqual(["sisyphus"])
    })

    test("canonical order length is exactly 1", () => {
      expect(CANONICAL_CORE_AGENT_ORDER).toHaveLength(1)
    })
  })

  describe("reorderAgentsByPriority", () => {
    const sisyphus = getAgentListDisplayName("sisyphus")
    const oracle = getAgentDisplayName("oracle")
    const librarian = getAgentDisplayName("librarian")
    const explore = getAgentDisplayName("explore")

    test("keeps sisyphus first when present", () => {
      const agents: Record<string, unknown> = {
        [oracle]: { name: "oracle" },
        custom: { name: "custom" },
        [sisyphus]: { name: "sisyphus" },
      }

      const result = reorderAgentsByPriority(agents)

      expect(Object.keys(result)[0]).toBe(sisyphus)
    })

    test("injects the order field only for sisyphus", () => {
      const agents: Record<string, unknown> = {
        [sisyphus]: { name: "sisyphus", mode: "primary" },
        [oracle]: { name: "oracle", mode: "subagent" },
      }

      const result = reorderAgentsByPriority(agents)

      expect(result[sisyphus]).toEqual({ name: "sisyphus", mode: "primary", order: 1 })
      expect(result[oracle]).toEqual({ name: "oracle", mode: "subagent" })
    })

    test("sorts non-core agents alphabetically after sisyphus", () => {
      const agents: Record<string, unknown> = {
        zebra: { name: "zebra" },
        [sisyphus]: { name: "sisyphus" },
        apple: { name: "apple" },
        [librarian]: { name: "librarian" },
        [explore]: { name: "explore" },
      }

      const result = reorderAgentsByPriority(agents)
      const keys = Object.keys(result)

      expect(keys[0]).toBe(sisyphus)
      expect(keys.slice(1)).toEqual(["apple", "explore", "librarian", "zebra"])
    })
  })
})
