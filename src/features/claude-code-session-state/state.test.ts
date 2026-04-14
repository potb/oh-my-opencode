/// <reference path="../../../bun-test.d.ts" />

import { describe, it as test, expect, beforeEach, afterEach } from "bun:test"
import {
  setSessionAgent,
  getSessionAgent,
  clearSessionAgent,
  updateSessionAgent,
  setMainSession,
  getMainSessionID,
  registerAgentName,
  isAgentRegistered,
  resolveRegisteredAgentName,
  _resetForTesting,
} from "./state"

describe("claude-code-session-state", () => {
  beforeEach(() => {
    // given - clean state before each test
    _resetForTesting()
  })

  afterEach(() => {
    // then - cleanup after each test to prevent pollution
    _resetForTesting()
  })

  describe("setSessionAgent", () => {
    test("should store agent for session", () => {
      // given
      const sessionID = "test-session-1"
      const agent = "Metis - Plan Consultant"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe(agent)
    })

    test("should strip zero-width ordering prefixes before storing agent for session", () => {
      // given
      const sessionID = "test-session-prefixed"
      const agent = "\u200B\u200B\u200BMetis - Plan Consultant"

      // when
      setSessionAgent(sessionID, agent)

      // then
      expect(getSessionAgent(sessionID)).toBe("Metis - Plan Consultant")
    })

    test("should NOT overwrite existing agent (first-write wins)", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Metis - Plan Consultant")

      // when - try to overwrite
      setSessionAgent(sessionID, "sisyphus")

      // then - first agent preserved
      expect(getSessionAgent(sessionID)).toBe("Metis - Plan Consultant")
    })

    test("should return undefined for unknown session", () => {
      // given - no session set

      // when / then
      expect(getSessionAgent("unknown-session")).toBe(undefined)
    })
  })

  describe("updateSessionAgent", () => {
    test("should overwrite existing agent", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Metis - Plan Consultant")

      // when - force update
      updateSessionAgent(sessionID, "sisyphus")

      // then
      expect(getSessionAgent(sessionID)).toBe("sisyphus")
    })

    test("should strip zero-width ordering prefixes when overwriting existing agent", () => {
      // given
      const sessionID = "test-session-prefixed-update"
      setSessionAgent(sessionID, "sisyphus")

      // when
      updateSessionAgent(sessionID, "\u200B\u200BMetis - Plan Consultant")

      // then
      expect(getSessionAgent(sessionID)).toBe("Metis - Plan Consultant")
    })
  })

  describe("clearSessionAgent", () => {
    test("should remove agent from session", () => {
      // given
      const sessionID = "test-session-1"
      setSessionAgent(sessionID, "Metis - Plan Consultant")
      expect(getSessionAgent(sessionID)).toBe("Metis - Plan Consultant")

      // when
      clearSessionAgent(sessionID)

      // then
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("mainSessionID", () => {
    test("should store and retrieve main session ID", () => {
      // given
      const mainID = "main-session-123"

      // when
      setMainSession(mainID)

      // then
      expect(getMainSessionID()).toBe(mainID)
    })

    test("should return undefined when not set", () => {
      // given - explicit reset to ensure clean state (parallel test isolation)
      _resetForTesting()
      // then
      expect(getMainSessionID()).toBe(undefined)
    })
  })

  describe("agent registration", () => {
    test("should register config-key lookup when given a known display name", () => {
      // given - Sisyphus - Ultraworker resolves to config key "sisyphus"
      registerAgentName("Sisyphus - Ultraworker")

      // when / then
      expect(isAgentRegistered("sisyphus")).toBe(true)
      expect(isAgentRegistered("Sisyphus - Ultraworker")).toBe(true)
    })

    test("should resolve config keys back to the registered raw agent name", () => {
      // given
      registerAgentName("\u200B\u200B\u200B\u200BSisyphus - Ultraworker")

      // when / then
      expect(resolveRegisteredAgentName("sisyphus")).toBe("\u200B\u200B\u200B\u200BSisyphus - Ultraworker")
      expect(resolveRegisteredAgentName("Sisyphus - Ultraworker")).toBe("\u200B\u200B\u200B\u200BSisyphus - Ultraworker")
    })

    describe("#given display name with zero-width prefix", () => {
      describe("#when checking registration without the zero-width prefix", () => {
        test("#then it treats the display name as registered", () => {
          // given
          registerAgentName("\u200BSisyphus - Ultraworker")

          // when
          const isRegistered = isAgentRegistered("Sisyphus - Ultraworker")

          // then
          expect(isRegistered).toBe(true)
        })
      })
    })
  })

  describe("display-name integration scenario", () => {
    test("should correctly identify agent display names for downstream hooks", () => {
      // given - Metis session
      const sessionID = "test-metis-session"
      const metisAgent = "Metis - Plan Consultant"

      // when - agent is set (simulating chat.message hook)
      setSessionAgent(sessionID, metisAgent)

      // then - getSessionAgent returns the exact display name
      const agent = getSessionAgent(sessionID)
      expect(agent).toBe("Metis - Plan Consultant")
      expect(["Metis - Plan Consultant"].includes(agent!)).toBe(true)
    })

    test("should return undefined when agent not set (bug scenario)", () => {
      // given - session exists but no agent set (the bug)
      const sessionID = "test-metis-session"

      // when / then - this is the bug: agent is undefined
      expect(getSessionAgent(sessionID)).toBe(undefined)
    })
  })

  describe("issue #893: custom agent switch reset", () => {
    test("should preserve custom agent when default agent is sent on subsequent messages", () => {
      // given - user switches to custom agent "MyCustomAgent"
      const sessionID = "test-session-custom"
      const customAgent = "MyCustomAgent"
      const defaultAgent = "sisyphus"

      // User switches to custom agent (via UI)
      setSessionAgent(sessionID, customAgent)
      expect(getSessionAgent(sessionID)).toBe(customAgent)

      // when - first message after switch sends default agent
      // This simulates the bug: input.agent = "Sisyphus" on first message
      // Using setSessionAgent (first-write wins) should preserve custom agent
      setSessionAgent(sessionID, defaultAgent)

      // then - custom agent should be preserved, NOT overwritten
      expect(getSessionAgent(sessionID)).toBe(customAgent)
    })

    test("should allow explicit agent update via updateSessionAgent", () => {
      // given - custom agent is set
      const sessionID = "test-session-explicit"
      const customAgent = "MyCustomAgent"
      const newAgent = "AnotherAgent"

      setSessionAgent(sessionID, customAgent)

      // when - explicit update (user intentionally switches)
      updateSessionAgent(sessionID, newAgent)

      // then - should be updated
      expect(getSessionAgent(sessionID)).toBe(newAgent)
    })
  })
})
