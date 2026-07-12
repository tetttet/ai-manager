import {
  apiFetch,
  readJson,
  type WorkspaceApiRequestContext,
} from "@/lib/api-client";

export type MemoryTopic = {
  id: string;
  title: string;
  status: "open" | "archived";
  summary: string;
  importantData: Record<string, unknown>;
  tags: string[];
  messageCount: number;
  tokenCountEstimate: number;
  lastMessageAt: string | null;
  startedAt: string;
  endedAt: string | null;
  updatedAt: string;
};

export type WorkflowMessage = {
  id: string;
  direction: "inbound" | "outbound";
  messageType: string;
  text: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type WorkflowConversation = {
  id: string;
  agentId: string;
  agentName: string;
  integrationId: string;
  botUsername: string | null;
  botDisplayName: string | null;
  contactId: string | null;
  contactDisplayName: string | null;
  contactUsername: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  contactLanguageCode: string | null;
  channelType: "telegram";
  externalConversationId: string;
  conversationType: string;
  title: string | null;
  status: "open" | "closed";
  metadata: Record<string, unknown>;
  inboundCount: number;
  outboundCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  memoryTopics: MemoryTopic[];
  latestMessages: WorkflowMessage[];
};

export type AiRun = {
  id: string;
  runType: "telegram_reply" | "memory_update";
  status: "started" | "succeeded" | "failed" | "skipped";
  provider: string;
  model: string | null;
  jobId: string | null;
  completionId: string | null;
  agentId: string | null;
  agentName: string | null;
  conversationId: string | null;
  conversationTitle: string | null;
  contactDisplayName: string | null;
  contactUsername: string | null;
  botUsername: string | null;
  memoryTopicId: string | null;
  memoryTopicTitle: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  promptTokensEstimate: number;
  completionTokensEstimate: number;
  totalTokensEstimate: number;
  maxPromptTokens: number;
  maxCompletionTokens: number;
  knowledgeSourceCount: number;
  metadata: Record<string, unknown>;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
};

export type WorkflowRunsSnapshot = {
  stats: {
    conversations: number;
    openConversations: number;
    messages: number;
    memoryTopics: number;
    aiRuns: number;
    tokens: number;
  };
  conversations: WorkflowConversation[];
  recentRuns: AiRun[];
};

export type WorkflowQueuesSnapshot = {
  queue: {
    available: boolean;
    name: string;
    isPaused: boolean | null;
    counts: Record<string, number>;
    error: string | null;
  };
  runStats: {
    started: number;
    succeeded: number;
    failed: number;
    skipped: number;
    tokens: number;
    knowledgeSources: number;
  };
  recentRuns: AiRun[];
};

type ApiContext = WorkspaceApiRequestContext;

export async function fetchWorkflowRuns(context: ApiContext) {
  return readJson<WorkflowRunsSnapshot>(
    await apiFetch("workflows/runs", {
      context,
      cache: "no-store",
    }),
  );
}

export async function fetchWorkflowQueues(context: ApiContext) {
  return readJson<WorkflowQueuesSnapshot>(
    await apiFetch("workflows/queues", {
      context,
      cache: "no-store",
    }),
  );
}
