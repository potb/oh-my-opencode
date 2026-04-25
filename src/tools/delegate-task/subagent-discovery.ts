import { getAgentConfigKey, getAgentDisplayName, stripAgentListSortPrefix } from "../../shared/agent-display-names"

type AgentMode = "subagent" | "primary" | "all" | undefined

export type AgentInfo = {
  name: string
  mode?: "subagent" | "primary" | "all"
  model?: { providerID: string; modelID: string }
}

export function sanitizeSubagentType(subagentType: string): string {
  return subagentType.trim().replace(/^[\\\/"']+|[\\\/"']+$/g, "").trim()
}

export function normalizeAvailableAgents(serverAgents: AgentInfo[]): AgentInfo[] {
  const mergedAgentMap = new Map<string, AgentInfo>()
  const addIfAbsent = (agent: AgentInfo): void => {
    const key = agent.name.toLowerCase()
    if (!mergedAgentMap.has(key)) {
      mergedAgentMap.set(key, agent)
    }
  }

  for (const agent of serverAgents) addIfAbsent(agent)

  return Array.from(mergedAgentMap.values())
}

function buildComparableNames(agentName: string): Set<string> {
  return new Set([
    agentName,
    getAgentDisplayName(agentName),
    getAgentConfigKey(agentName),
  ].map(name => stripAgentListSortPrefix(name).trim().toLowerCase()))
}

function matchesRequestedAgent(agent: AgentInfo, requestedAgentName: string): boolean {
  const comparableNames = buildComparableNames(requestedAgentName)
  const listedAgentName = stripAgentListSortPrefix(agent.name).trim().toLowerCase()
  const listedAgentConfigKey = getAgentConfigKey(agent.name).trim().toLowerCase()

  return comparableNames.has(listedAgentName) || comparableNames.has(listedAgentConfigKey)
}

function isTaskCallableAgentMode(mode: AgentMode): boolean {
  return mode === "all" || mode === "subagent"
}

export function findPrimaryAgentMatch(
  agents: AgentInfo[],
  requestedAgentName: string,
): AgentInfo | undefined {
  return agents.find(agent => agent.mode === "primary" && matchesRequestedAgent(agent, requestedAgentName))
}

export function findCallableAgentMatch(
  agents: AgentInfo[],
  requestedAgentName: string,
): AgentInfo | undefined {
  return agents.find(agent => isTaskCallableAgentMode(agent.mode) && matchesRequestedAgent(agent, requestedAgentName))
}

export function listCallableAgentNames(agents: AgentInfo[]): string {
  return agents
    .filter(agent => isTaskCallableAgentMode(agent.mode))
    .map(agent => stripAgentListSortPrefix(agent.name))
    .sort()
    .join(", ")
}
