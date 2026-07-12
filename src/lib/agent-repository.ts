import type { AgentConnectionState } from "@/lib/agent-connections";
import {
  apiFetch,
  readJson,
  type WorkspaceApiRequestContext,
} from "@/lib/api-client";

export type AgentStatus = "active" | "inactive";

export type Agent = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: number;
  errors: number;
  messageProgress: number;
  errorProgress: number;
  status: AgentStatus;
};

export type CreateAgentInput = {
  name: string;
  description: string;
};

export type UpdateAgentInput = CreateAgentInput;

export type AgentRepository = {
  listAgents: () => Promise<Agent[]>;
  createAgent: (input: CreateAgentInput) => Promise<Agent>;
  updateAgent: (agentId: string, input: UpdateAgentInput) => Promise<Agent>;
  deleteAgent: (agentId: string) => Promise<void>;
};

type ApiContext = WorkspaceApiRequestContext;

export const agentsUpdatedEventName = "ai-manager:agents-updated";

export function createRemoteAgentRepository(
  context: ApiContext,
): AgentRepository {
  return {
    async listAgents() {
      const payload = await readJson<{ agents: Agent[] }>(
        await apiFetch("agents", {
          context,
          cache: "no-store",
        }),
      );

      return payload.agents;
    },
    async createAgent(input) {
      const payload = await readJson<{ agent: Agent }>(
        await apiFetch("agents", {
          method: "POST",
          context,
          json: input,
        }),
      );

      return payload.agent;
    },
    async updateAgent(agentId, input) {
      const payload = await readJson<{ agent: Agent }>(
        await apiFetch(`agents/${agentId}`, {
          method: "PATCH",
          context,
          json: input,
        }),
      );

      return payload.agent;
    },
    async deleteAgent(agentId) {
      await readJson<void>(
        await apiFetch(`agents/${agentId}`, {
          method: "DELETE",
          context,
        }),
      );
    },
  };
}

export async function fetchRemoteAgentConnectionState(
  agentId: string,
  context: ApiContext,
) {
  const payload = await readJson<{ state: AgentConnectionState }>(
    await apiFetch(`agents/${agentId}/connection-state`, {
      context,
      cache: "no-store",
    }),
  );

  return payload.state;
}

export async function saveRemoteAgentConnectionState(
  agentId: string,
  state: AgentConnectionState,
  context: ApiContext,
) {
  const payload = await readJson<{ state: AgentConnectionState }>(
    await apiFetch(`agents/${agentId}/connection-state`, {
      method: "PUT",
      context,
      json: { state },
    }),
  );

  return payload.state;
}
