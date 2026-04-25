import { describe, expect, test } from "bun:test"
import { createOhMyOpenCodeJsonSchema } from "./build-schema-document"

describe("build-schema-document", () => {
  test("generates trimmed root schema", () => {
    // given
    const expectedDraft = "http://json-schema.org/draft-07/schema#"

    // when
    const schema = createOhMyOpenCodeJsonSchema()
    const properties = schema.properties as Record<string, unknown>

    // then
    expect(schema.$schema).toBe(expectedDraft)
    expect(schema.title).toBe("Oh My OpenCode Configuration")
    expect(properties).toBeDefined()
    expect(properties.agents).toBeDefined()
    expect(properties.background_task).toBeDefined()
    expect(properties.disabled_tools).toBeDefined()
  })
})
