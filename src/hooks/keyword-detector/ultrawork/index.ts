/**
 * Ultrawork message module - routes to appropriate message based on agent/model.
 *
 * Routing:
 * 1. Planner agents (plan) → planner.ts
 * 2. GPT models → gpt.ts
 * 3. Gemini models → gemini.ts
 * 4. Default (Claude, etc.) → default.ts (optimized for Claude series)
 */

export {
  isPlannerAgent,
  isNonOmoAgent,
  
  
  
} from "./source-detector";
;
;
;
;
;

import { getUltraworkSource } from "./source-detector";
import { getPlannerUltraworkMessage } from "./planner";
import { getGptUltraworkMessage } from "./gpt";
import { getDefaultUltraworkMessage } from "./default";
import { getGeminiUltraworkMessage } from "./gemini";

/**
 * Gets the appropriate ultrawork message based on agent and model context.
 */
export function getUltraworkMessage(
  agentName?: string,
  modelID?: string,
): string {
  const source = getUltraworkSource(agentName, modelID);

  switch (source) {
    case "planner":
      return getPlannerUltraworkMessage();
    case "gpt":
      return getGptUltraworkMessage();
    case "gemini":
      return getGeminiUltraworkMessage();
    case "default":
    default:
      return getDefaultUltraworkMessage();
  }
}
