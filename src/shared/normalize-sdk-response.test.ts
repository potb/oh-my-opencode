import { describe, expect, it } from "bun:test"
import { normalizeSDKResponse } from "./normalize-sdk-response"

describe("normalizeSDKResponse", () => {
  it("returns data array when response includes data", () => {
    //#given
    const response = { data: [{ id: "1" }] }

    //#when
    const result = normalizeSDKResponse<Array<{ id: string }>>(response)

    //#then
    expect(result).toEqual([{ id: "1" }])
  })

  it("throws when data is missing", () => {
    //#given
    const response = {}
    //#when / #then
    expect(() => normalizeSDKResponse<Array<{ id: string }>>(response)).toThrow("SDK response must use { data: ... } envelope")
  })

  it("throws when SDK returns a plain array", () => {
    //#given
    const response = [{ id: "2" }]

    //#when / #then
    expect(() => normalizeSDKResponse<Array<{ id: string }>>(response)).toThrow("SDK response must use { data: ... } envelope")
  })

  it("throws when object response has no data", () => {
    //#given
    const response = { value: "legacy" }

    //#when / #then
    expect(() => normalizeSDKResponse<{ value: string }>(response)).toThrow("SDK response must use { data: ... } envelope")
  })

  it("throws for null response", () => {
    //#given
    const response = null

    //#when / #then
    expect(() => normalizeSDKResponse<string[]>(response)).toThrow("SDK response was nullish")
  })

  it("throws when response.data is nullish", () => {
    //#given
    const response = { data: undefined as { connected: string[] } | undefined }
    //#when / #then
    expect(() => normalizeSDKResponse<{ connected: string[] }>(response)).toThrow("SDK response.data was missing")
  })
})
