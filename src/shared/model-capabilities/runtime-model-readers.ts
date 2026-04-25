import type { ModelMetadata } from "../connected-providers-cache"

import type { ModelCapabilities } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined
}

function readStringArray(value: unknown): string[] | undefined {
	if (!Array.isArray(value)) {
		return undefined
	}

	const strings = value.filter((item): item is string => typeof item === "string")
	return strings.length > 0 ? strings : undefined
}

function normalizeVariantKeys(value: unknown): string[] | undefined {
	const arrayVariants = readStringArray(value)
	if (arrayVariants) {
		return arrayVariants.map((variant) => variant.toLowerCase())
	}

	if (!isRecord(value)) {
		return undefined
	}

	const variants = Object.keys(value).map((variant) => variant.toLowerCase())
	return variants.length > 0 ? variants : undefined
}

function readModalityKeys(value: unknown): string[] | undefined {
	const stringArray = readStringArray(value)
	if (stringArray) {
		return stringArray.map((entry) => entry.toLowerCase())
	}

	if (!isRecord(value)) {
		return undefined
	}

	const enabled = Object.entries(value)
		.filter(([, supported]) => supported === true)
		.map(([modality]) => modality.toLowerCase())

	return enabled.length > 0 ? enabled : undefined
}

function normalizeModalities(value: unknown): ModelCapabilities["modalities"] | undefined {
	if (!isRecord(value)) {
		return undefined
	}

	const input = readModalityKeys(value.input)
	const output = readModalityKeys(value.output)

	if (!input && !output) {
		return undefined
	}

	return {
		...(input ? { input } : {}),
		...(output ? { output } : {}),
	}
}

function readRuntimeModelCapabilities(
	runtimeModel: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
	return isRecord(runtimeModel?.capabilities) ? runtimeModel.capabilities : undefined
}

function readRuntimeModelBoolean(
	runtimeModel: Record<string, unknown> | undefined,
	key: string,
): boolean | undefined {
	const value = runtimeModel?.[key]
	if (typeof value === "boolean") {
		return value
	}
	return undefined
}

export function readRuntimeModel(
	runtimeModel: ModelMetadata | Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
	return isRecord(runtimeModel) ? runtimeModel : undefined
}

export function readRuntimeModelVariants(
	runtimeModel: Record<string, unknown> | undefined,
): string[] | undefined {
	return normalizeVariantKeys(runtimeModel?.variants)
}

export function readRuntimeModelModalities(
	runtimeModel: Record<string, unknown> | undefined,
): ModelCapabilities["modalities"] | undefined {
	return normalizeModalities(runtimeModel?.modalities)
}

export function readRuntimeModelReasoningSupport(
	runtimeModel: Record<string, unknown> | undefined,
): boolean | undefined {
	return readRuntimeModelBoolean(runtimeModel, "reasoning")
}

export function readRuntimeModelThinkingSupport(
	runtimeModel: Record<string, unknown> | undefined,
): boolean | undefined {
	const capabilityValue = readRuntimeModelReasoningSupport(runtimeModel)
	if (capabilityValue !== undefined) {
		return capabilityValue
	}

	const thinkingSupport = readRuntimeModelBoolean(runtimeModel, "thinking")
	if (thinkingSupport !== undefined) {
		return thinkingSupport
	}

	return undefined
}

export function readRuntimeModelTemperatureSupport(
	runtimeModel: Record<string, unknown> | undefined,
): boolean | undefined {
	return readRuntimeModelBoolean(runtimeModel, "temperature")
}

export function readRuntimeModelTopPSupport(
	runtimeModel: Record<string, unknown> | undefined,
): boolean | undefined {
	return readRuntimeModelBoolean(runtimeModel, "topP")
}

export function readRuntimeModelToolCallSupport(
	runtimeModel: Record<string, unknown> | undefined,
): boolean | undefined {
	return readRuntimeModelBoolean(runtimeModel, "toolCall")
}

export function readRuntimeModelLimitOutput(
	runtimeModel: Record<string, unknown> | undefined,
): number | undefined {
	const limit = isRecord(runtimeModel?.limit)
		? runtimeModel.limit
		: undefined

	if (!isRecord(limit)) {
		return undefined
	}

	return readNumber(limit.output)
}
