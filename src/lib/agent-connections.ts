export type CanvasSourceType = "website" | "document" | "table" | "text";
export type CanvasChannelId = "whatsapp" | "telegram";

export type CanvasKnowledgeSource = {
  id: string;
  name: string;
  type: CanvasSourceType;
  summary: string;
  mode: string;
  status: string;
  knowledgeBaseName: string;
};

export type CanvasNodePosition = {
  x: number;
  y: number;
};

export type CanvasChannelApiSettings = {
  fields: Record<string, string>;
  enabledEvents: Record<string, boolean>;
};

export type AgentConnectionState = {
  connectedSourceIds: string[];
  connectedChannelIds?: CanvasChannelId[];
  placedSourceIds?: string[];
  placedChannelIds?: CanvasChannelId[];
  nodePositions: Record<string, CanvasNodePosition>;
  agentNodePosition?: CanvasNodePosition;
  channelNodePositions?: Partial<Record<CanvasChannelId, CanvasNodePosition>>;
  channelApiSettings?: Partial<
    Record<CanvasChannelId, CanvasChannelApiSettings>
  >;
};

export type DatabaseKnowledgeBaseForCanvas = {
  id: string;
  name: string;
};

export type DatabaseKnowledgeSourceForCanvas = {
  id: string;
  name: string;
  type: CanvasSourceType;
  mode?: string;
  status?: string;
  url?: string;
  fileName?: string;
  table?: {
    columns?: unknown[];
    rows?: unknown[];
  };
  content?: string;
};

export type DatabaseKnowledgeTableForCanvas = {
  id: string;
  name: string;
  columns?: unknown[];
  rows?: unknown[];
};

export type DatabaseKnowledgeCanvasState = {
  knowledgeBases: DatabaseKnowledgeBaseForCanvas[];
  sourcesByKnowledgeBaseId: Record<string, DatabaseKnowledgeSourceForCanvas[]>;
};

type StoredAgentConnections = {
  version: 1;
  agents: Record<string, AgentConnectionState>;
};

const knowledgeBaseStorageKey = "ai-manager:knowledge-base:general:v1";
const tableStorageKey = "ai-manager:knowledge-base:tables:v1";
const agentConnectionsStorageKey =
  "ai-manager:dashboard:agent-connections:v1";

const fallbackSources: CanvasKnowledgeSource[] = [
  {
    id: "demo:website:company-help",
    name: "Company Help Center",
    type: "website",
    summary: "support.ai-manager.test",
    mode: "high",
    status: "ready",
    knowledgeBaseName: "Default Knowledge Base",
  },
  {
    id: "demo:document:onboarding",
    name: "Onboarding PDF",
    type: "document",
    summary: "customer-onboarding.pdf",
    mode: "medium",
    status: "ready",
    knowledgeBaseName: "Default Knowledge Base",
  },
  {
    id: "demo:table:pricing",
    name: "Pricing Table",
    type: "table",
    summary: "4 columns · 28 rows",
    mode: "high",
    status: "ready",
    knowledgeBaseName: "Tables",
  },
  {
    id: "demo:text:tone",
    name: "Bot Tone Guide",
    type: "text",
    summary: "Short answer style and escalation rules",
    mode: "medium",
    status: "ready",
    knowledgeBaseName: "Default Knowledge Base",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isCanvasSourceType(value: unknown): value is CanvasSourceType {
  return (
    value === "website" ||
    value === "document" ||
    value === "table" ||
    value === "text"
  );
}

function isCanvasChannelId(value: unknown): value is CanvasChannelId {
  return value === "whatsapp" || value === "telegram";
}

function isNodePosition(value: unknown): value is CanvasNodePosition {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    typeof value.y === "number" &&
    Number.isFinite(value.y)
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every(isString);
}

function isBooleanRecord(value: unknown): value is Record<string, boolean> {
  return (
    isRecord(value) &&
    Object.values(value).every((recordValue) => typeof recordValue === "boolean")
  );
}

function isCanvasChannelApiSettings(
  value: unknown,
): value is CanvasChannelApiSettings {
  return (
    isRecord(value) &&
    isStringRecord(value.fields) &&
    isBooleanRecord(value.enabledEvents)
  );
}

function isAgentConnectionState(
  value: unknown,
): value is AgentConnectionState {
  return (
    isRecord(value) &&
    Array.isArray(value.connectedSourceIds) &&
    value.connectedSourceIds.every(isString) &&
    (value.connectedChannelIds === undefined ||
      (Array.isArray(value.connectedChannelIds) &&
        value.connectedChannelIds.every(isCanvasChannelId))) &&
    (value.placedSourceIds === undefined ||
      (Array.isArray(value.placedSourceIds) &&
        value.placedSourceIds.every(isString))) &&
    (value.placedChannelIds === undefined ||
      (Array.isArray(value.placedChannelIds) &&
        value.placedChannelIds.every(isCanvasChannelId))) &&
    isRecord(value.nodePositions) &&
    Object.values(value.nodePositions).every(isNodePosition) &&
    (value.agentNodePosition === undefined ||
      isNodePosition(value.agentNodePosition)) &&
    (value.channelNodePositions === undefined ||
      (isRecord(value.channelNodePositions) &&
        Object.entries(value.channelNodePositions).every(
          ([channelId, position]) =>
            isCanvasChannelId(channelId) && isNodePosition(position),
        ))) &&
    (value.channelApiSettings === undefined ||
      (isRecord(value.channelApiSettings) &&
        Object.entries(value.channelApiSettings).every(
          ([channelId, settings]) =>
            isCanvasChannelId(channelId) &&
            isCanvasChannelApiSettings(settings),
        )))
  );
}

function isStoredAgentConnections(
  value: unknown,
): value is StoredAgentConnections {
  return (
    isRecord(value) &&
    value.version === 1 &&
    isRecord(value.agents) &&
    Object.values(value.agents).every(isAgentConnectionState)
  );
}

function readJson(storage: Storage, key: string) {
  try {
    const storedValue = storage.getItem(key);

    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function getTextSummary(value: unknown) {
  if (!isString(value) || !value.trim()) {
    return "Text source";
  }

  return value.trim().slice(0, 72);
}

function getSourceSummary(source: Record<string, unknown>) {
  if (source.type === "website") {
    return isString(source.url) ? source.url : "Website source";
  }

  if (source.type === "document") {
    return isString(source.fileName) ? source.fileName : "Document source";
  }

  if (source.type === "table") {
    const table = source.table;

    if (isRecord(table) && Array.isArray(table.columns) && Array.isArray(table.rows)) {
      return `${table.columns.length} columns · ${table.rows.length} rows`;
    }

    return "Table source";
  }

  return getTextSummary(source.content);
}

function readGeneralKnowledgeSources(storage: Storage): CanvasKnowledgeSource[] {
  const storedState = readJson(storage, knowledgeBaseStorageKey);

  if (
    !isRecord(storedState) ||
    !Array.isArray(storedState.knowledgeBases) ||
    !isRecord(storedState.sourcesByKnowledgeBaseId)
  ) {
    return [];
  }

  const knowledgeBaseNamesById = new Map<string, string>();

  storedState.knowledgeBases.forEach((knowledgeBase) => {
    if (
      isRecord(knowledgeBase) &&
      isString(knowledgeBase.id) &&
      isString(knowledgeBase.name)
    ) {
      knowledgeBaseNamesById.set(knowledgeBase.id, knowledgeBase.name);
    }
  });

  return Object.entries(storedState.sourcesByKnowledgeBaseId).flatMap(
    ([knowledgeBaseId, sources]) => {
      if (!Array.isArray(sources)) {
        return [];
      }

      const knowledgeBaseName =
        knowledgeBaseNamesById.get(knowledgeBaseId) ?? "Knowledge Base";

      return sources.flatMap((source): CanvasKnowledgeSource[] => {
        if (
          !isRecord(source) ||
          !isString(source.id) ||
          !isString(source.name) ||
          !isCanvasSourceType(source.type)
        ) {
          return [];
        }

        return [
          {
            id: `general:${source.id}`,
            name: source.name,
            type: source.type,
            summary: getSourceSummary(source),
            mode: isString(source.mode) ? source.mode : "medium",
            status: isString(source.status) ? source.status : "ready",
            knowledgeBaseName,
          },
        ];
      });
    },
  );
}

function readTableKnowledgeSources(storage: Storage): CanvasKnowledgeSource[] {
  const storedState = readJson(storage, tableStorageKey);

  if (!isRecord(storedState) || !Array.isArray(storedState.tables)) {
    return [];
  }

  return storedState.tables.flatMap((table): CanvasKnowledgeSource[] => {
    if (!isRecord(table) || !isString(table.id) || !isString(table.name)) {
      return [];
    }

    const columnCount = Array.isArray(table.columns) ? table.columns.length : 0;
    const rowCount = Array.isArray(table.rows) ? table.rows.length : 0;

    return [
      {
        id: `table:${table.id}`,
        name: table.name,
        type: "table",
        summary: `${columnCount} columns · ${rowCount} rows`,
        mode: "medium",
        status: "ready",
        knowledgeBaseName: "Tables",
      },
    ];
  });
}

function uniqueKnowledgeSources(sources: CanvasKnowledgeSource[]) {
  const sourceIds = new Set<string>();

  return sources.filter((source) => {
    if (sourceIds.has(source.id)) {
      return false;
    }

    sourceIds.add(source.id);
    return true;
  });
}

function getTableKnowledgeSummary(table: DatabaseKnowledgeTableForCanvas) {
  const columnCount = Array.isArray(table.columns) ? table.columns.length : 0;
  const rowCount = Array.isArray(table.rows) ? table.rows.length : 0;

  return `${columnCount} columns · ${rowCount} rows`;
}

export function buildKnowledgeCanvasSourcesFromDatabase(
  generalState: DatabaseKnowledgeCanvasState,
  tables: DatabaseKnowledgeTableForCanvas[],
) {
  const knowledgeBaseNamesById = new Map(
    generalState.knowledgeBases.map((knowledgeBase) => [
      knowledgeBase.id,
      knowledgeBase.name,
    ]),
  );
  const generalSources = Object.entries(
    generalState.sourcesByKnowledgeBaseId,
  ).flatMap(([knowledgeBaseId, sources]) => {
    const knowledgeBaseName =
      knowledgeBaseNamesById.get(knowledgeBaseId) ?? "Knowledge Base";

    return sources.map((source) => ({
      id: `general:${source.id}`,
      name: source.name,
      type: source.type,
      summary: getSourceSummary(source as unknown as Record<string, unknown>),
      mode: source.mode ?? "medium",
      status: source.status ?? "ready",
      knowledgeBaseName,
    }));
  });
  const tableSources = tables.map((table) => ({
    id: `table:${table.id}`,
    name: table.name,
    type: "table" as const,
    summary: getTableKnowledgeSummary(table),
    mode: "medium",
    status: "ready",
    knowledgeBaseName: "Tables",
  }));

  return uniqueKnowledgeSources([...generalSources, ...tableSources]);
}

function readStoredConnections(storage: Storage): StoredAgentConnections {
  const storedState = readJson(storage, agentConnectionsStorageKey);

  if (isStoredAgentConnections(storedState)) {
    return storedState;
  }

  return {
    version: 1,
    agents: {},
  };
}

export function loadKnowledgeCanvasSources(storage: Storage) {
  const sources = [
    ...readGeneralKnowledgeSources(storage),
    ...readTableKnowledgeSources(storage),
  ];
  const uniqueSources = uniqueKnowledgeSources(sources);

  return uniqueSources.length > 0 ? uniqueSources : fallbackSources;
}

export function loadAgentConnectionState(
  storage: Storage,
  agentId: string,
): AgentConnectionState {
  const storedConnections = readStoredConnections(storage);

  return (
    storedConnections.agents[agentId] ?? {
      connectedSourceIds: [],
      connectedChannelIds: [],
      placedSourceIds: [],
      placedChannelIds: [],
      nodePositions: {},
      channelNodePositions: {},
      channelApiSettings: {},
    }
  );
}

export function saveAgentConnectionState(
  storage: Storage,
  agentId: string,
  state: AgentConnectionState,
) {
  try {
    const storedConnections = readStoredConnections(storage);
    const nextState: StoredAgentConnections = {
      version: 1,
      agents: {
        ...storedConnections.agents,
        [agentId]: state,
      },
    };

    storage.setItem(agentConnectionsStorageKey, JSON.stringify(nextState));
  } catch {
    // Canvas remains interactive when browser storage is unavailable.
  }
}
