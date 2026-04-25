import type { BackgroundTaskConfig } from "../../config"
import { PLUGIN_CONFIG } from "../../plugin-config"

const BASE_BACKGROUND_TASK_CONFIG = PLUGIN_CONFIG.background_task

type BackgroundTaskConfigOverrides = Partial<Omit<BackgroundTaskConfig, "circuitBreaker">> & {
  circuitBreaker?: Partial<BackgroundTaskConfig["circuitBreaker"]>
}

export function createBackgroundTaskConfig(
  overrides: BackgroundTaskConfigOverrides = {}
): BackgroundTaskConfig {
  return {
    ...BASE_BACKGROUND_TASK_CONFIG,
    ...overrides,
    providerConcurrency: overrides.providerConcurrency ?? BASE_BACKGROUND_TASK_CONFIG.providerConcurrency,
    modelConcurrency: overrides.modelConcurrency ?? BASE_BACKGROUND_TASK_CONFIG.modelConcurrency,
    circuitBreaker: {
      ...BASE_BACKGROUND_TASK_CONFIG.circuitBreaker,
      ...overrides.circuitBreaker,
    },
  }
}
