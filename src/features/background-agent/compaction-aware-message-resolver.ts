import type { StoredMessage } from "../../shared/session-message-context"
import {
  isCompactionAgent,
  isCompactionMessage,
} from "../../shared/compaction-marker"

type SessionMessage = {
  id?: string
  info?: {
    agent?: string
    model?: {
      providerID?: string
      modelID?: string
      variant?: string
    }
    tools?: StoredMessage["tools"]
  }
  parts?: Array<{ type?: string }>
}

function hasPartialAgentOrModel(message: StoredMessage): boolean {
  const hasAgent = !!message.agent && !isCompactionAgent(message.agent)
  const hasModel = !!message.model?.providerID && !!message.model?.modelID
  return hasAgent || hasModel || !!message.tools
}

function convertSessionMessageToStoredMessage(message: SessionMessage): StoredMessage | null {
  if (isCompactionMessage(message)) {
    return null
  }

  const info = message.info
  if (!info) {
    return null
  }

  const providerID = info.model?.providerID
  const modelID = info.model?.modelID

  return {
    ...(info.agent ? { agent: info.agent } : {}),
    ...(providerID && modelID
      ? {
          model: {
            providerID,
            modelID,
            ...(info.model?.variant ? { variant: info.model.variant } : {}),
          },
        }
      : {}),
    ...(info.tools ? { tools: info.tools } : {}),
  }
}

function mergeStoredMessages(
  messages: Array<StoredMessage | null>,
): StoredMessage | null {
	for (const message of messages) {
		if (!message || isCompactionAgent(message.agent)) {
			continue
		}

		if (hasPartialAgentOrModel(message)) {
			return message
		}
	}

	return null
}

export function resolvePromptContextFromSessionMessages(
  messages: SessionMessage[],
  _sessionID?: string,
): StoredMessage | null {
  const convertedMessages = messages
    .map(convertSessionMessageToStoredMessage)
    .reverse()

  return mergeStoredMessages(convertedMessages)
}
