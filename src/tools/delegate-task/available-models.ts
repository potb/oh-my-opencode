import type { OpencodeClient } from "./types"
import { log } from "../../shared/logger"
import { readConnectedProvidersCache, readProviderModelsCache } from "../../shared/connected-providers-cache"

function addFromProviderModels(
  out: Set<string>,
  providerID: string,
  models: Array<{ id?: string }> | undefined
): void {
  if (!models) return
  for (const item of models) {
    const modelID = item?.id
    if (!modelID) continue
    out.add(`${providerID}/${modelID}`)
  }
}

export async function getAvailableModelsForDelegateTask(client: OpencodeClient): Promise<Set<string>> {
  void client
  const providerModelsCache = readProviderModelsCache()

  if (providerModelsCache?.models) {
    const connected = new Set(providerModelsCache.connected)

    const out = new Set<string>()
    for (const [providerID, models] of Object.entries(providerModelsCache.models)) {
      if (!connected.has(providerID)) continue
      addFromProviderModels(out, providerID, models as Array<{ id?: string }> | undefined)
    }
    return out
  }

  throw new Error("provider-models cache unavailable")
}
