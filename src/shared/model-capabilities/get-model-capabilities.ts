import { findProviderModelMetadata } from "../connected-providers-cache"
import { resolveModelIDAlias } from "../model-capability-aliases"
import { detectHeuristicModelFamily } from "../model-capability-heuristics"

import { getBundledModelCapabilitiesSnapshot } from "./bundled-snapshot"
import {
	readRuntimeModel,
	readRuntimeModelLimitOutput,
	readRuntimeModelModalities,
	readRuntimeModelReasoningSupport,
	readRuntimeModelTemperatureSupport,
	readRuntimeModelThinkingSupport,
	readRuntimeModelToolCallSupport,
	readRuntimeModelTopPSupport,
	readRuntimeModelVariants,
} from "./runtime-model-readers"
import type {
	GetModelCapabilitiesInput,
	ModelCapabilities,
	ModelCapabilitiesDiagnostics,
} from "./types"

export function getModelCapabilities(input: GetModelCapabilitiesInput): ModelCapabilities {
	const canonicalization = resolveModelIDAlias(input.modelID)
	const runtimeModel = readRuntimeModel(
		input.runtimeModel ?? findProviderModelMetadata(input.providerID, input.modelID),
	)
	const runtimeSnapshot = input.runtimeSnapshot
	const bundledSnapshot = input.bundledSnapshot ?? getBundledModelCapabilitiesSnapshot()
	const snapshotEntry = runtimeSnapshot?.models?.[canonicalization.canonicalModelID]
		?? bundledSnapshot.models[canonicalization.canonicalModelID]
	const heuristicFamily = detectHeuristicModelFamily(canonicalization.canonicalModelID)

	const runtimeVariants = readRuntimeModelVariants(runtimeModel)
	const runtimeReasoning = readRuntimeModelReasoningSupport(runtimeModel)
	const runtimeThinking = readRuntimeModelThinkingSupport(runtimeModel)
	const runtimeTemperature = readRuntimeModelTemperatureSupport(runtimeModel)
	const runtimeTopP = readRuntimeModelTopPSupport(runtimeModel)
	const runtimeMaxOutputTokens = readRuntimeModelLimitOutput(runtimeModel)
	const runtimeToolCall = readRuntimeModelToolCallSupport(runtimeModel)
	const runtimeModalities = readRuntimeModelModalities(runtimeModel)

	const snapshotSource: ModelCapabilitiesDiagnostics["snapshot"]["source"] =
		runtimeSnapshot?.models?.[canonicalization.canonicalModelID]
			? "runtime-snapshot"
			: bundledSnapshot.models[canonicalization.canonicalModelID]
			? "bundled-snapshot"
			: "none"
	const familySource: ModelCapabilitiesDiagnostics["family"]["source"] =
		snapshotEntry?.family ? "snapshot" : heuristicFamily?.family ? "heuristic" : "none"
	const variantsSource: ModelCapabilitiesDiagnostics["variants"]["source"] =
		runtimeVariants ? "runtime" : heuristicFamily?.variants ? "heuristic" : "none"
	const reasoningEffortsSource: ModelCapabilitiesDiagnostics["reasoningEfforts"]["source"] =
		heuristicFamily?.reasoningEfforts ? "heuristic" : "none"
	const reasoningSource: ModelCapabilitiesDiagnostics["reasoning"]["source"] =
		runtimeReasoning === undefined ? snapshotEntry?.reasoning === undefined ? "none" : snapshotSource : "runtime"
	const supportsThinkingSource: ModelCapabilitiesDiagnostics["supportsThinking"]["source"] =
		heuristicFamily?.supportsThinking !== undefined
			? "heuristic"
			: runtimeThinking !== undefined
			? "runtime"
			: snapshotEntry?.reasoning !== undefined
			? snapshotSource
			: "none"
	const supportsTemperatureSource: ModelCapabilitiesDiagnostics["supportsTemperature"]["source"] =
		runtimeTemperature !== undefined
			? "runtime"
			: snapshotEntry?.temperature !== undefined
			? snapshotSource
			: "none"
	const supportsTopPSource: ModelCapabilitiesDiagnostics["supportsTopP"]["source"] =
		runtimeTopP !== undefined ? "runtime" : "none"
	const maxOutputTokensSource: ModelCapabilitiesDiagnostics["maxOutputTokens"]["source"] =
		runtimeMaxOutputTokens !== undefined
			? "runtime"
			: snapshotEntry?.limit?.output !== undefined
			? snapshotSource
			: "none"
	const toolCallSource: ModelCapabilitiesDiagnostics["toolCall"]["source"] =
		runtimeToolCall !== undefined ? "runtime" : snapshotEntry?.toolCall !== undefined ? snapshotSource : "none"
	const modalitiesSource: ModelCapabilitiesDiagnostics["modalities"]["source"] =
		runtimeModalities !== undefined ? "runtime" : snapshotEntry?.modalities !== undefined ? snapshotSource : "none"
	const resolutionMode: ModelCapabilitiesDiagnostics["resolutionMode"] =
		snapshotSource !== "none" && canonicalization.source === "canonical"
			? "snapshot-backed"
			: familySource === "heuristic" || variantsSource === "heuristic" || reasoningEffortsSource === "heuristic"
			? "heuristic-backed"
			: "unknown"

	return {
		requestedModelID: canonicalization.requestedModelID,
		canonicalModelID: canonicalization.canonicalModelID,
		family: snapshotEntry?.family ?? heuristicFamily?.family,
		variants: runtimeVariants ?? heuristicFamily?.variants,
		reasoningEfforts: heuristicFamily?.reasoningEfforts,
		reasoning: runtimeReasoning ?? snapshotEntry?.reasoning,
		supportsThinking: heuristicFamily?.supportsThinking ?? runtimeThinking ?? snapshotEntry?.reasoning,
		supportsTemperature: runtimeTemperature ?? snapshotEntry?.temperature,
		supportsTopP: runtimeTopP,
		maxOutputTokens: runtimeMaxOutputTokens ?? snapshotEntry?.limit?.output,
		toolCall: runtimeToolCall ?? snapshotEntry?.toolCall,
		modalities: runtimeModalities ?? snapshotEntry?.modalities,
			diagnostics: {
				resolutionMode,
				canonicalization: {
					source: canonicalization.source,
				},
			snapshot: { source: snapshotSource },
			family: { source: familySource },
			variants: { source: variantsSource },
			reasoningEfforts: { source: reasoningEffortsSource },
			reasoning: { source: reasoningSource },
			supportsThinking: { source: supportsThinkingSource },
			supportsTemperature: { source: supportsTemperatureSource },
			supportsTopP: { source: supportsTopPSource },
			maxOutputTokens: { source: maxOutputTokensSource },
			toolCall: { source: toolCallSource },
			modalities: { source: modalitiesSource },
		},
	}
}
