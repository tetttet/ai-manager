import {
  apiFetch,
  readJson,
  type WorkspaceApiRequestContext,
} from "@/lib/api-client";

export type AgentChannelType = "telegram";
export type AgentChannelStatus = "connected";
export type TelegramWebhookStatus =
  | "not_configured"
  | "pending"
  | "registered"
  | "failed";

export type AgentChannel = {
  channelType: AgentChannelType;
  status: AgentChannelStatus;
  botUsername: string | null;
  botDisplayName: string | null;
  tokenConfigured: boolean;
  webhookStatus: TelegramWebhookStatus;
  webhookRegisteredAt: string | null;
  webhookLastError: string | null;
  lastUpdateReceivedAt: string | null;
  connectedAt: string | null;
};

type ApiContext = WorkspaceApiRequestContext;

export async function fetchAgentChannels(agentId: string, context: ApiContext) {
  const payload = await readJson<{ channels: AgentChannel[] }>(
    await apiFetch(`agents/${agentId}/channels`, {
      context,
      cache: "no-store",
    }),
  );

  return payload.channels;
}

export async function connectTelegramAgentChannel(
  agentId: string,
  botToken: string,
  context: ApiContext,
) {
  const payload = await readJson<{ channel: AgentChannel }>(
    await apiFetch(`agents/${agentId}/channels/telegram`, {
      method: "POST",
      context,
      json: { botToken },
    }),
  );

  return payload.channel;
}

export async function disconnectTelegramAgentChannel(
  agentId: string,
  context: ApiContext,
) {
  await readJson<void>(
    await apiFetch(`agents/${agentId}/channels/telegram`, {
      method: "DELETE",
      context,
    }),
  );
}
