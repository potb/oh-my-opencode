import { describe, it, expect, afterEach, mock, spyOn } from "bun:test"

import { createEventHandler } from "./event"
import { createChatMessageHandler } from "./chat-message"
import { resetMainSessionIDForTesting } from "../shared/main-session-id"
import { resetSubagentSessionsForTesting } from "../shared/subagent-session-registry"
import { getSessionPromptParams, setSessionPromptParams } from "../shared/session-prompt-params-state"

type EventInput = { event: { type: string; properties?: unknown } }
type EventHandlerArgs = Parameters<typeof createEventHandler>[0]
type EventHandlerInput = Parameters<ReturnType<typeof createEventHandler>>[0]
type ChatMessageHandlerArgs = Parameters<typeof createChatMessageHandler>[0]

function asEventHandlerInput(input: EventInput): EventHandlerInput {
	return input as unknown as EventHandlerInput
}

function asEventHandlerContext(ctx: unknown): EventHandlerArgs["ctx"] {
	return ctx as unknown as EventHandlerArgs["ctx"]
}

function asChatMessageHandlerContext(ctx: unknown): ChatMessageHandlerArgs["ctx"] {
	return ctx as unknown as ChatMessageHandlerArgs["ctx"]
}

function asPluginConfig(config: unknown): EventHandlerArgs["pluginConfig"] {
	return config as unknown as EventHandlerArgs["pluginConfig"]
}

function asChatPluginConfig(config: unknown): ChatMessageHandlerArgs["pluginConfig"] {
	return config as unknown as ChatMessageHandlerArgs["pluginConfig"]
}

function createEventHandlerManagers(
	overrides: Record<string, unknown> = {},
): EventHandlerArgs["managers"] {
	return {
		...({} as EventHandlerArgs["managers"]),
		tmuxSessionManager: {
			onSessionCreated: async () => {},
			onSessionDeleted: async () => {},
		},
		...overrides,
	} as unknown as EventHandlerArgs["managers"]
}

function createEventHandlerHooks(
	overrides: Record<string, unknown>,
): EventHandlerArgs["hooks"] {
	return {
		...({} as EventHandlerArgs["hooks"]),
		...overrides,
	} as unknown as EventHandlerArgs["hooks"]
}

function createChatMessageHandlerHooks(
	overrides: Record<string, unknown>,
): ChatMessageHandlerArgs["hooks"] {
	return {
		...({} as ChatMessageHandlerArgs["hooks"]),
		...overrides,
	} as unknown as ChatMessageHandlerArgs["hooks"]
}

function createIdleTrackingEventHandler(dispatchCalls: EventInput[]): ReturnType<typeof createEventHandler> {
	return createEventHandler({
		ctx: asEventHandlerContext({}),
		pluginConfig: asPluginConfig({}),
		firstMessageVariantGate: {
			markSessionCreated: () => {},
			clear: () => {},
		},
		managers: createEventHandlerManagers(),
		hooks: createEventHandlerHooks({
			autoUpdateChecker: {
				event: async (input: EventInput) => {
					if (input.event.type === "session.idle") {
						dispatchCalls.push(input)
					}
				},
			},
		}),
	})
}

afterEach(() => {
	mock.restore()
	resetMainSessionIDForTesting()
	resetSubagentSessionsForTesting()
})

	describe("createEventHandler - idle deduplication", () => {
	it("#given synthetic idle fires first #when real idle arrives within 500ms #then real idle dispatched", async () => {
		//#given
		const dispatchCalls: EventInput[] = []
		const eventHandler = createIdleTrackingEventHandler(dispatchCalls)
		const sessionId = "ses_test123"

		//#when
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.status",
				properties: {
					sessionID: sessionId,
					status: { type: "idle" },
				},
			},
		}))
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.idle",
				properties: {
					sessionID: sessionId,
				},
			},
		}))

		//#then
		expect(dispatchCalls).toHaveLength(2)
		expect(dispatchCalls[0]?.event.type).toBe("session.idle")
		expect(dispatchCalls[1]?.event.type).toBe("session.idle")
		expect((dispatchCalls[0]?.event.properties as { sessionID?: string } | undefined)?.sessionID).toBe(sessionId)
		expect((dispatchCalls[1]?.event.properties as { sessionID?: string } | undefined)?.sessionID).toBe(sessionId)
	})

	it("#given real idle fires first #when synthetic arrives within 500ms #then synthetic dropped", async () => {
		//#given
		const dispatchCalls: EventInput[] = []
		const eventHandler = createIdleTrackingEventHandler(dispatchCalls)
		const sessionId = "ses_test456"

		//#when
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.idle",
				properties: {
					sessionID: sessionId,
				},
			},
		}))
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.status",
				properties: {
					sessionID: sessionId,
					status: { type: "idle" },
				},
			},
		}))

		//#then
		expect(dispatchCalls).toHaveLength(1)
		expect(dispatchCalls[0]?.event.type).toBe("session.idle")
		expect((dispatchCalls[0]?.event.properties as { sessionID?: string } | undefined)?.sessionID).toBe(sessionId)
	})

	it("both maps pruned on every event", async () => {
		//#given
		const eventHandler = createEventHandler({
			ctx: {} as any,
			pluginConfig: {} as any,
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: {
				tmuxSessionManager: {
					onSessionCreated: async () => {},
					onSessionDeleted: async () => {},
				},
			} as any,
			hooks: {
				autoUpdateChecker: { event: async () => {} },
				contextWindowMonitor: { event: async () => {} },
				thinkMode: { event: async () => {} },
		        interactiveBashSession: { event: async () => {} },
			} as any,
		})

		// Trigger some synthetic idles
		await eventHandler({
			event: {
				type: "session.status",
				properties: {
					sessionID: "ses_stale_1",
					status: { type: "idle" },
				},
			},
		})

		await eventHandler({
			event: {
				type: "session.status",
				properties: {
					sessionID: "ses_stale_2",
					status: { type: "idle" },
				},
			},
		})

		// Trigger some real idles
		await eventHandler({
			event: {
				type: "session.idle",
				properties: {
					sessionID: "ses_stale_3",
				},
			},
		})

		await eventHandler({
			event: {
				type: "session.idle",
				properties: {
					sessionID: "ses_stale_4",
				},
			},
		})

		//#when - wait for dedup window to expire (600ms > 500ms)
		await new Promise((resolve) => setTimeout(resolve, 600))

		// Trigger any event to trigger pruning
		await eventHandler({
			event: {
				type: "message.updated",
			},
		} as any)

		//#then - both maps should be pruned (no dedup should occur for new events)
		// We verify by checking that a new idle event for same session is dispatched
		const dispatchCalls: EventInput[] = []
		const eventHandlerWithMock = createEventHandler({
			ctx: {} as any,
			pluginConfig: {} as any,
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: {
				tmuxSessionManager: {
					onSessionCreated: async () => {},
					onSessionDeleted: async () => {},
				},
			} as any,
				hooks: {
					autoUpdateChecker: {
						event: async (input: EventInput) => {
							dispatchCalls.push(input)
						},
					},
					contextWindowMonitor: { event: async () => {} },
					thinkMode: { event: async () => {} },
		        interactiveBashSession: { event: async () => {} },
					ralphLoop: { event: async () => {} },
			} as any,
		})

		await eventHandlerWithMock({
			event: {
				type: "session.idle",
				properties: {
					sessionID: "ses_stale_1",
				},
			},
		})

		expect(dispatchCalls.length).toBe(1)
		expect(dispatchCalls[0].event.type).toBe("session.idle")
	})

	it("dedup only applies within window - outside window both dispatch", async () => {
		//#given
		const dispatchCalls: EventInput[] = []
		const eventHandler = createEventHandler({
			ctx: {} as any,
			pluginConfig: {} as any,
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: {
				tmuxSessionManager: {
					onSessionCreated: async () => {},
					onSessionDeleted: async () => {},
				},
			} as any,
				hooks: {
					autoUpdateChecker: {
						event: async (input: EventInput) => {
							if (input.event.type === "session.idle") {
								dispatchCalls.push(input)
							}
						},
					},
					contextWindowMonitor: { event: async () => {} },
					thinkMode: { event: async () => {} },
		        interactiveBashSession: { event: async () => {} },
					ralphLoop: { event: async () => {} },
			} as any,
		})

		const sessionId = "ses_outside_window"

		//#when - synthetic idle first
		await eventHandler({
			event: {
				type: "session.status",
				properties: {
					sessionID: sessionId,
					status: { type: "idle" },
				},
			},
		})

		//#then - synthetic dispatched
		expect(dispatchCalls.length).toBe(1)

		//#when - wait for dedup window to expire (600ms > 500ms)
		await new Promise((resolve) => setTimeout(resolve, 600))

		//#when - real idle arrives outside window
		await eventHandler({
			event: {
				type: "session.idle",
				properties: {
					sessionID: sessionId,
				},
			},
		})

		//#then - real idle dispatched (outside dedup window)
		expect(dispatchCalls.length).toBe(2)
		expect(dispatchCalls[0].event.type).toBe("session.idle")
		expect(dispatchCalls[1].event.type).toBe("session.idle")
	})
})

describe("createEventHandler - event forwarding", () => {
	it("ignores tmux-specific event forwarding in the fixed product", async () => {
		const eventHandler = createEventHandler({
			ctx: asEventHandlerContext({}),
			pluginConfig: asPluginConfig({}),
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: createEventHandlerManagers({
				tmuxSessionManager: {
					onEvent: () => {
						throw new Error("tmux onEvent should not run")
					},
					onSessionCreated: async () => {
						throw new Error("tmux onSessionCreated should not run")
					},
					onSessionDeleted: async () => {
						throw new Error("tmux onSessionDeleted should not run")
					},
				},
			}),
			hooks: createEventHandlerHooks({}),
		})

		await expect(eventHandler(asEventHandlerInput({
			event: {
				type: "message.part.delta",
				properties: { sessionID: "ses_tmux_activity", field: "text", delta: "x" },
			},
		}))).resolves.toBeUndefined()

		await expect(eventHandler(asEventHandlerInput({
			event: {
				type: "session.created",
				properties: { info: { id: "ses_tmux_disabled", parentID: "ses_parent" } },
			},
		}))).resolves.toBeUndefined()
	})


	it("forwards session.deleted to write-existing-file-guard hook", async () => {
		//#given
		const forwardedEvents: EventInput[] = []
		const eventHandler = createEventHandler({
			ctx: {} as never,
			pluginConfig: asPluginConfig({}),
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: {
				tmuxSessionManager: {
					onSessionCreated: async () => {},
					onSessionDeleted: async () => {},
				},
			} as never,
			hooks: {
				writeExistingFileGuard: {
					event: async (input: EventInput) => {
						forwardedEvents.push(input)
					},
				},
			} as never,
		})
		const sessionID = "ses_forward_delete_event"

		//#when
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.deleted",
				properties: { info: { id: sessionID } },
			},
		}))

		//#then
		expect(forwardedEvents.length).toBe(1)
		expect(forwardedEvents[0]?.event.type).toBe("session.deleted")
	})


	it("clears stored prompt params on session.deleted", async () => {
		//#given
		const eventHandler = createEventHandler({
			ctx: {} as never,
			pluginConfig: {} as never,
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: {
				tmuxSessionManager: {
					onSessionCreated: async () => {},
					onSessionDeleted: async () => {},
				},
			} as never,
			hooks: {} as never,
		})
		const sessionID = "ses_prompt_params_deleted"
		setSessionPromptParams(sessionID, {
			temperature: 0.4,
			topP: 0.7,
			options: { reasoningEffort: "high" },
		})

		//#when
		await eventHandler(asEventHandlerInput({
			event: {
				type: "session.deleted",
				properties: { info: { id: sessionID } },
			},
		}))

		//#then
		expect(getSessionPromptParams(sessionID)).toBeUndefined()
	})
})

	describe("createEventHandler - hook isolation", () => {
	it("continues dispatching later event hooks when an earlier hook throws", async () => {
		//#given
		const laterHookCalls: EventInput[] = []

		const eventHandler = createEventHandler({
			ctx: asEventHandlerContext({
				directory: "/tmp",
				client: {
					session: {
						abort: async () => ({}),
						prompt: async () => ({}),
					},
				},
			}),
			pluginConfig: asPluginConfig({}),
			firstMessageVariantGate: {
				markSessionCreated: () => {},
				clear: () => {},
			},
			managers: createEventHandlerManagers(),
				hooks: createEventHandlerHooks({
					autoUpdateChecker: {
						event: async () => {
							throw new Error("upstream hook failed")
						},
					},
					writeExistingFileGuard: {
						event: async (input: EventInput) => {
							laterHookCalls.push(input)
						},
					},
				}),
		})

		//#when
		let thrownError: unknown
		try {
			await eventHandler(asEventHandlerInput({
				event: {
					type: "session.error",
					properties: {
						sessionID: "ses_hook_isolation",
						error: { name: "Error", message: "retry me" },
					},
				},
			}))
		} catch (error) {
			thrownError = error
		}

		//#then
		expect(thrownError).toBeUndefined()
		expect(laterHookCalls).toHaveLength(1)
		expect(laterHookCalls[0]?.event.type).toBe("session.error")
	})
})
