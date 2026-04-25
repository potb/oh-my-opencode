import { BUILTIN_SERVERS } from "./constants"
import type { ResolvedServer } from "./types"

interface ServerWithSource extends ResolvedServer {
  source: "builtin"
}

export function getMergedServers(): ServerWithSource[] {
  const servers: ServerWithSource[] = []

  for (const [id, config] of Object.entries(BUILTIN_SERVERS)) {
    servers.push({
      id,
      command: config.command,
      extensions: config.extensions,
      priority: -100,
      source: "builtin",
    })
  }

  return servers.sort((a, b) => b.priority - a.priority)
}
