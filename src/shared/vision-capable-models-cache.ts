import type { VisionCapableModel } from "../plugin-state"

let visionCapableModelsCache = new Map<string, VisionCapableModel>()

export function setVisionCapableModelsCache(
  cache: Map<string, VisionCapableModel>,
): void {
  visionCapableModelsCache = cache
}
