import { describe, test, expect, beforeEach } from "bun:test"
import { setSessionTools, getSessionTools, deleteSessionTools } from "./session-tools-store"

describe("session-tools-store", () => {
  beforeEach(() => {
    deleteSessionTools("ses_unknown")
    deleteSessionTools("ses_abc123")
    deleteSessionTools("ses_1")
    deleteSessionTools("ses_2")
  })

  test("returns undefined for unknown session", () => {
    //#given
    const sessionID = "ses_unknown"

    //#when
    const result = getSessionTools(sessionID)

    //#then
    expect(result).toBeUndefined()
  })

  test("stores and retrieves tools for a session", () => {
    //#given
    const sessionID = "ses_abc123"
    const tools = { question: false, task: true, task_create: false }

    //#when
    setSessionTools(sessionID, tools)
    const result = getSessionTools(sessionID)

    //#then
    expect(result).toEqual({ question: false, task: true, task_create: false })
  })

  test("overwrites existing tools for same session", () => {
    //#given
    const sessionID = "ses_abc123"
    setSessionTools(sessionID, { question: false })

    //#when
    setSessionTools(sessionID, { question: true, task: false })
    const result = getSessionTools(sessionID)

    //#then
    expect(result).toEqual({ question: true, task: false })
  })

  test("deleteSessionTools removes a stored entry", () => {
    //#given
    setSessionTools("ses_1", { question: false })

    //#when
    deleteSessionTools("ses_1")

    //#then
    expect(getSessionTools("ses_1")).toBeUndefined()
  })

  test("returns a copy, not a reference", () => {
    //#given
    const sessionID = "ses_abc123"
    const tools = { question: false }
    setSessionTools(sessionID, tools)

    //#when
    const result = getSessionTools(sessionID)!
    result.question = true

    //#then
    expect(getSessionTools(sessionID)).toEqual({ question: false })
  })
})
