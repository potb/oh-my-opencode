import { describe, expect, test } from "bun:test"
import { createOhMyOpenCodeJsonSchema } from "./build-schema-document"

describe("build-schema-document", () => {
  test("generates trimmed root schema", () => {
    // given
    const expectedDraft = "http://json-schema.org/draft-07/schema#"

    // when
    const schema = createOhMyOpenCodeJsonSchema()

    // then
    expect(schema.$schema).toBe(expectedDraft)
    expect(schema.title).toBe("Oh My OpenCode Configuration")
    expect(schema.properties).toBeDefined()
    expect(schema.properties.skills).toBeUndefined()
    expect(schema.properties.sisyphus_agent).toBeUndefined()
    expect(schema.properties.auto_update).toBeUndefined()
    expect(schema.properties.model_capabilities).toBeUndefined()
    expect(schema.properties.babysitting).toBeUndefined()
  })
})
