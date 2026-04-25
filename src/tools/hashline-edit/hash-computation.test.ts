import { describe, it, expect } from "bun:test"
import {
  computeLineHash,
} from "./hash-computation"

describe("computeLineHash", () => {
  it("returns deterministic 2-char CID hash per line", () => {
    //#given
    const content = "function hello() {"

    //#when
    const hash1 = computeLineHash(1, content)
    const hash2 = computeLineHash(1, content)

    //#then
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[ZPMQVRWSNKTXJBYH]{2}$/)
  })

  it("produces same hashes for significant content on different lines", () => {
    //#given
    const content = "function hello() {"

    //#when
    const hash1 = computeLineHash(1, content)
    const hash2 = computeLineHash(2, content)

    //#then
    expect(hash1).toBe(hash2)
  })

  it("mixes line number for non-significant lines", () => {
    //#given
    const punctuationOnly = "{}"

    //#when
    const hash1 = computeLineHash(1, punctuationOnly)
    const hash2 = computeLineHash(2, punctuationOnly)

    //#then
    expect(hash1).not.toBe(hash2)
  })

  it("produces different hashes for different leading indentation", () => {
    //#given
    const content1 = "function hello() {"
    const content2 = "  function hello() {"

    //#when
    const hash1 = computeLineHash(1, content1)
    const hash2 = computeLineHash(1, content2)

    //#then
    expect(hash1).not.toBe(hash2)
  })

  it("ignores trailing whitespace differences", () => {
    //#given
    const content1 = "function hello() {"
    const content2 = "function hello() {  "

    //#when
    const hash1 = computeLineHash(1, content1)
    const hash2 = computeLineHash(1, content2)

    //#then
    expect(hash1).toBe(hash2)
  })

  it("produces same hash for CRLF and LF line endings", () => {
    //#given
    const content1 = "function hello() {"
    const content2 = "function hello() {\r"

    //#when
    const hash1 = computeLineHash(1, content1)
    const hash2 = computeLineHash(1, content2)

    //#then
    expect(hash1).toBe(hash2)
  })
})
