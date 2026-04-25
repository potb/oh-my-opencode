import type { ModelMetadata } from "../connected-providers-cache"

export type ModelCapabilitiesSnapshotEntry = {
	id: string
	family?: string
	reasoning?: boolean
	temperature?: boolean
	toolCall?: boolean
	modalities?: {
		input?: string[]
		output?: string[]
	}
	limit?: {
		context?: number
		input?: number
		output?: number
	}
}

export type ModelCapabilitiesSnapshot = {
	generatedAt: string
	sourceUrl: string
	models: Record<string, ModelCapabilitiesSnapshotEntry>
}

export type ModelCapabilitiesDiagnostics = {
	resolutionMode: "snapshot-backed" | "heuristic-backed" | "unknown"
	canonicalization: {
		source: "canonical"
	}
	snapshot: {
		source: "runtime-snapshot" | "bundled-snapshot" | "none"
	}
	family: { source: "snapshot" | "heuristic" | "none" }
	variants: { source: "none" | "runtime" | "heuristic" | "canonical" }
	reasoningEfforts: { source: "none" | "heuristic" }
	reasoning: { source: "runtime" | "runtime-snapshot" | "bundled-snapshot" | "none" }
	supportsThinking: { source: "runtime" | "heuristic" | "runtime-snapshot" | "bundled-snapshot" | "none" }
	supportsTemperature: { source: "runtime" | "runtime-snapshot" | "bundled-snapshot" | "none" }
	supportsTopP: { source: "runtime" | "none" }
	maxOutputTokens: { source: "runtime" | "runtime-snapshot" | "bundled-snapshot" | "none" }
	toolCall: { source: "runtime" | "runtime-snapshot" | "bundled-snapshot" | "none" }
	modalities: { source: "runtime" | "runtime-snapshot" | "bundled-snapshot" | "none" }
}

export type ModelCapabilities = {
	requestedModelID: string
	canonicalModelID: string
	family?: string
	variants?: string[]
	reasoningEfforts?: string[]
	reasoning?: boolean
	supportsThinking?: boolean
	supportsTemperature?: boolean
	supportsTopP?: boolean
	maxOutputTokens?: number
	toolCall?: boolean
	modalities?: {
		input?: string[]
		output?: string[]
	}
	diagnostics: ModelCapabilitiesDiagnostics
}

export type GetModelCapabilitiesInput = {
	providerID: string
	modelID: string
	runtimeModel?: ModelMetadata | Record<string, unknown>
	runtimeSnapshot?: ModelCapabilitiesSnapshot
	bundledSnapshot?: ModelCapabilitiesSnapshot
}
