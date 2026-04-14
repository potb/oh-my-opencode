import { describe, expect, it } from "bun:test"
import {
  DELEGATE_TASK_ERROR_PATTERNS,
  detectDelegateTaskError,
  buildRetryGuidance,
} from "./index"

describe("sisyphus-task-retry", () => {
  describe("DELEGATE_TASK_ERROR_PATTERNS", () => {
    // given error patterns are defined
    // then should include all known task error types
    it("should contain all known error patterns", () => {
      expect(DELEGATE_TASK_ERROR_PATTERNS.length).toBeGreaterThanOrEqual(5)
      
      const patternTexts = DELEGATE_TASK_ERROR_PATTERNS.map(p => p.pattern)
      expect(patternTexts).toContain("run_in_background")
      expect(patternTexts).toContain("subagent_type")
      expect(patternTexts).toContain("Unknown agent")
    })
  })

  describe("detectDelegateTaskError", () => {
    // given tool output with run_in_background error
    // when detecting error
    // then should return matching error info
    it("should detect run_in_background missing error", () => {
      const output = "[ERROR] Invalid arguments: 'run_in_background' parameter is REQUIRED. Use run_in_background=false for task delegation."
      
      const result = detectDelegateTaskError(output)
      
      expect(result).not.toBeNull()
      expect(result?.errorType).toBe("missing_run_in_background")
    })

    it("should detect missing or invalid subagent_type guidance", () => {
      const output = "[ERROR] Invalid arguments: Must provide subagent_type for new tasks."

      const result = detectDelegateTaskError(output)

      expect(result).not.toBeNull()
      expect(result?.errorType).toBe("missing_or_invalid_subagent_type")
    })

    it("should detect unknown agent error", () => {
      const output = '[ERROR] Unknown agent: "fake-agent". Available agents: explore, librarian, oracle'
      
      const result = detectDelegateTaskError(output)
      
      expect(result).not.toBeNull()
      expect(result?.errorType).toBe("unknown_agent")
    })

    it("should return null for successful output", () => {
      const output = "Background task launched.\n\nTask ID: bg_12345\nSession ID: ses_abc"
      
      const result = detectDelegateTaskError(output)
      
      expect(result).toBeNull()
    })
  })

  describe("buildRetryGuidance", () => {
    // given detected error
    // when building retry guidance
    // then should return actionable fix instructions
    it("should provide fix for missing run_in_background", () => {
      const errorInfo = { errorType: "missing_run_in_background", originalOutput: "" }
      
      const guidance = buildRetryGuidance(errorInfo)
      
      expect(guidance).toContain("run_in_background")
      expect(guidance).toContain("REQUIRED")
    })

    it("should provide fix for missing subagent type", () => {
      const errorInfo = { 
        errorType: "missing_or_invalid_subagent_type", 
        originalOutput: '[ERROR] Invalid arguments: Must provide subagent_type for new tasks.' 
      }
      
      const guidance = buildRetryGuidance(errorInfo)
      
      expect(guidance).toContain("subagent_type")
      expect(guidance).toContain("explore")
    })

    it("should provide fix for unknown agent with available list", () => {
      const errorInfo = { 
        errorType: "unknown_agent", 
        originalOutput: '[ERROR] Unknown agent: "fake". Available agents: explore, oracle' 
      }
      
      const guidance = buildRetryGuidance(errorInfo)
      
      expect(guidance).toContain("explore")
      expect(guidance).toContain("oracle")
    })
  })
})
