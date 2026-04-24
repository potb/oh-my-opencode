import { z } from "zod"

export const BrowserAutomationProviderSchema = z.enum([
  "agent-browser",
])

export const BrowserAutomationConfigSchema = z.object({
  /**
   * Browser automation provider to use for the browser skill.
   * - "agent-browser": Uses agent-browser CLI
   */
  provider: BrowserAutomationProviderSchema.default("agent-browser"),
})

export type BrowserAutomationProvider = z.infer<
  typeof BrowserAutomationProviderSchema
>
type BrowserAutomationConfig = z.infer<typeof BrowserAutomationConfigSchema>
