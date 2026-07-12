"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, X } from "lucide-react";

import { AgentLogo } from "@/components/dashboard/agent-logo";
import { Button } from "@/components/ui/button";
import {
  connectTelegramAgentChannel,
  disconnectTelegramAgentChannel,
  fetchAgentChannels,
  type AgentChannel,
} from "@/lib/agent-channel-api";
import type {
  CanvasChannelApiSettings,
  CanvasChannelId,
  CanvasNodePosition,
  DatabaseKnowledgeCanvasState,
  DatabaseKnowledgeTableForCanvas,
} from "@/lib/agent-connections";
import {
  buildKnowledgeCanvasSourcesFromDatabase,
} from "@/lib/agent-connections";
import {
  fetchRemoteAgentConnectionState,
  saveRemoteAgentConnectionState,
} from "@/lib/agent-repository";
import {
  fetchGeneralKnowledgeBaseState,
  fetchKnowledgeTables,
} from "@/lib/knowledge-base-api";
import { cn } from "@/lib/utils";

import { AgentNode } from "./agent-node";
import { CanvasToolbar } from "./canvas-toolbar";
import { ChannelNode } from "./channel-node";
import {
  buildChannelApiSettings,
  getDefaultChannelApiSettings,
} from "./channel-settings-config";
import { ChannelSettingsPanel } from "./channel-settings-panel";
import { ConnectionLayer } from "./connection-layer";
import { ConnectionSummary } from "./connection-summary";
import {
  agentNodeHeight,
  agentNodeWidth,
  channelNodeHeight,
  channelNodes,
  channelNodeWidth,
  defaultViewport,
  gridSize,
  maxZoom,
  minZoom,
  sourceNodeHeight,
  sourceNodeWidth,
  zoomStep,
} from "./constants";
import { DragPreview } from "./drag-preview";
import {
  buildChannelNodePositions,
  buildNodePositions,
  clamp,
  createAgentConnectionState,
  getAgentConnectionPoint,
  getAgentOutputPoint,
  getDefaultAgentPosition,
  getDefaultChannelNodePositions,
  getDefaultNodePosition,
} from "./geometry";
import { LibraryPanel } from "./library-panel";
import { SourceNode } from "./source-node";
import type {
  AgentKnowledgeCanvasProps,
  CanvasWheelEvent,
  ConnectionDraft,
  DragState,
  ViewportState,
} from "./types";

const activeChannelNodes = channelNodes.filter((channel) => !channel.disabled);

function isCanvasChannelId(value: string): value is CanvasChannelId {
  return value === "whatsapp" || value === "telegram";
}

function isActiveCanvasChannelId(value: string): value is CanvasChannelId {
  return (
    isCanvasChannelId(value) &&
    activeChannelNodes.some((channel) => channel.id === value)
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function isChannelDisabled(channelId: CanvasChannelId) {
  return Boolean(
    channelNodes.find((channel) => channel.id === channelId)?.disabled,
  );
}

function matchesSearch(values: string[], search: string) {
  if (!search) {
    return true;
  }

  return values.some((value) => value.toLowerCase().includes(search));
}

function getAgentCenteredViewport(
  position: CanvasNodePosition,
  viewportRect: Pick<DOMRect, "width" | "height">,
  zoom = defaultViewport.zoom,
): ViewportState {
  return {
    zoom,
    x: viewportRect.width / 2 - (position.x + agentNodeWidth / 2) * zoom,
    y: viewportRect.height / 2 - (position.y + agentNodeHeight / 2) * zoom,
  };
}

function CanvasLoadingState() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-zinc-50">
      <div
        className="relative flex size-24 items-center justify-center"
        aria-label="Loading canvas"
        role="status"
      >
        <div className="absolute inset-0 rounded-full border border-zinc-200 bg-white shadow-sm" />
        <div className="absolute inset-3 rounded-full border border-zinc-100" />
        <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-sky-500 opacity-70" />
        <Loader2 className="relative size-7 animate-spin text-zinc-950" />
      </div>
    </div>
  );
}

export function AgentKnowledgeCanvas({
  agent,
  accountId,
  getToken,
  workspaceId,
  onClose,
}: AgentKnowledgeCanvasProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const latestSaveSequenceRef = useRef(0);
  const changeVersionRef = useRef(0);
  const centeredInitialViewKeyRef = useRef<string | null>(null);
  const [sources, setSources] = useState<
    ReturnType<typeof buildKnowledgeCanvasSourcesFromDatabase>
  >([]);
  const [placedSourceIds, setPlacedSourceIds] = useState<string[]>([]);
  const [placedChannelIds, setPlacedChannelIds] = useState<CanvasChannelId[]>(
    [],
  );
  const [connectedSourceIds, setConnectedSourceIds] = useState<string[]>([]);
  const [connectedChannelIds, setConnectedChannelIds] = useState<
    CanvasChannelId[]
  >([]);
  const [nodePositions, setNodePositions] = useState<
    Record<string, CanvasNodePosition>
  >({});
  const [channelNodePositions, setChannelNodePositions] = useState<
    Partial<Record<CanvasChannelId, CanvasNodePosition>>
  >({});
  const [channelApiSettings, setChannelApiSettings] = useState<
    Record<CanvasChannelId, CanvasChannelApiSettings>
  >(() => buildChannelApiSettings());
  const [agentChannels, setAgentChannels] = useState<AgentChannel[]>([]);
  const [pendingChannelAction, setPendingChannelAction] =
    useState<CanvasChannelId | null>(null);
  const [channelActionError, setChannelActionError] = useState<string | null>(
    null,
  );
  const [agentNodePosition, setAgentNodePosition] =
    useState<CanvasNodePosition>(() => getDefaultAgentPosition());
  const [viewport, setViewport] = useState<ViewportState>(defaultViewport);
  const [sourceSearch, setSourceSearch] = useState("");
  const [activeChannelSettings, setActiveChannelSettings] =
    useState<CanvasChannelId | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "dirty" | "saving" | "failed"
  >("saved");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectionDraft, setConnectionDraft] =
    useState<ConnectionDraft | null>(null);

  const placedSourceIdSet = useMemo(
    () => new Set(placedSourceIds),
    [placedSourceIds],
  );
  const placedChannelIdSet = useMemo(
    () => new Set(placedChannelIds),
    [placedChannelIds],
  );
  const connectedSourceIdSet = useMemo(
    () => new Set(connectedSourceIds),
    [connectedSourceIds],
  );
  const connectedChannelIdSet = useMemo(
    () => new Set(connectedChannelIds),
    [connectedChannelIds],
  );
  const placedSources = useMemo(
    () => sources.filter((source) => placedSourceIdSet.has(source.id)),
    [placedSourceIdSet, sources],
  );
  const placedChannels = useMemo(
    () =>
      activeChannelNodes.filter((channel) => placedChannelIdSet.has(channel.id)),
    [placedChannelIdSet],
  );
  const connectedSources = useMemo(
    () => placedSources.filter((source) => connectedSourceIdSet.has(source.id)),
    [connectedSourceIdSet, placedSources],
  );
  const connectedChannels = useMemo(
    () =>
      placedChannels.filter((channel) => connectedChannelIdSet.has(channel.id)),
    [connectedChannelIdSet, placedChannels],
  );
  const normalizedSearch = sourceSearch.trim().toLowerCase();
  const filteredLibrarySources = useMemo(() => {
    const availableSources = sources.filter(
      (source) => !placedSourceIdSet.has(source.id),
    );

    return availableSources.filter((source) =>
      matchesSearch(
        [
          source.name,
          source.summary,
          source.knowledgeBaseName,
          source.type,
        ],
        normalizedSearch,
      ),
    );
  }, [normalizedSearch, placedSourceIdSet, sources]);
  const filteredLibraryChannels = useMemo(() => {
    const availableChannels = channelNodes.filter(
      (channel) => !placedChannelIdSet.has(channel.id),
    );

    return availableChannels.filter((channel) =>
      matchesSearch(
        [channel.name, channel.label, channel.summary],
        normalizedSearch,
      ),
    );
  }, [normalizedSearch, placedChannelIdSet]);
  const activeAgentChannel = useMemo(() => {
    if (!activeChannelSettings) {
      return null;
    }

    return (
      agentChannels.find(
        (channel) => channel.channelType === activeChannelSettings,
      ) ?? null
    );
  }, [activeChannelSettings, agentChannels]);
  const draggedLibrarySource = useMemo(() => {
    if (dragState?.type !== "library-source") {
      return null;
    }

    return sources.find((source) => source.id === dragState.sourceId) ?? null;
  }, [dragState, sources]);
  const agentConnectionPoint = getAgentConnectionPoint(agentNodePosition);
  const agentOutputPoint = getAgentOutputPoint(agentNodePosition);
  const gridPixelSize = gridSize * viewport.zoom;
  const gridOffsetX = viewport.x % gridPixelSize;
  const gridOffsetY = viewport.y % gridPixelSize;
  const canSaveCanvas =
    hasHydrated && saveStatus !== "saving" && saveStatus !== "saved";

  useEffect(() => {
    let shouldIgnore = false;
    centeredInitialViewKeyRef.current = null;

    async function loadCanvasState() {
      try {
        setHasHydrated(false);
        setCanvasError(null);
        setSaveStatus("saved");
        const [generalState, tablesState, savedConnectionState, savedChannels] =
          await Promise.all([
            fetchGeneralKnowledgeBaseState({ getToken, workspaceId }),
            fetchKnowledgeTables<DatabaseKnowledgeTableForCanvas>({
              getToken,
              workspaceId,
            }),
            fetchRemoteAgentConnectionState(agent.id, {
              getToken,
              workspaceId,
            }),
            fetchAgentChannels(agent.id, {
              getToken,
              workspaceId,
            }),
          ]);

        if (shouldIgnore) {
          return;
        }

        const loadedSources = buildKnowledgeCanvasSourcesFromDatabase(
          generalState as DatabaseKnowledgeCanvasState,
          tablesState.tables,
        );
        const sourceIds = new Set(loadedSources.map((source) => source.id));
        const channelIds = new Set(
          activeChannelNodes.map((channel) => channel.id),
        );
        const nextConnectedSourceIds =
          savedConnectionState.connectedSourceIds.filter((sourceId) =>
            sourceIds.has(sourceId),
          );
        const savedConnectedChannelIds = (
          savedConnectionState.connectedChannelIds ?? []
        ).filter((channelId) => channelIds.has(channelId));
        const storedPlacedSourceIds = savedConnectionState.placedSourceIds ?? [];
        const nextPlacedSourceIds = (
          storedPlacedSourceIds.length > 0
            ? storedPlacedSourceIds
            : nextConnectedSourceIds
        ).filter((sourceId) => sourceIds.has(sourceId));
        const storedPlacedChannelIds =
          savedConnectionState.placedChannelIds ?? [];
        const nextPlacedChannelIds = (
          storedPlacedChannelIds.length > 0
            ? storedPlacedChannelIds
            : savedConnectedChannelIds
        ).filter(isActiveCanvasChannelId);
        const nextConnectedChannelIds = savedConnectedChannelIds.filter(
          (channelId) => nextPlacedChannelIds.includes(channelId),
        );
        const nextAgentNodePosition =
          savedConnectionState.agentNodePosition ?? getDefaultAgentPosition();

        setSources(loadedSources);
        setPlacedSourceIds(nextPlacedSourceIds);
        setPlacedChannelIds(nextPlacedChannelIds);
        setConnectedSourceIds(nextConnectedSourceIds);
        setConnectedChannelIds(nextConnectedChannelIds);
        setNodePositions(
          buildNodePositions(
            nextPlacedSourceIds,
            savedConnectionState.nodePositions,
          ),
        );
        setChannelNodePositions(
          buildChannelNodePositions(
            nextPlacedChannelIds,
            savedConnectionState.channelNodePositions,
            nextAgentNodePosition,
          ),
        );
        setChannelApiSettings(
          buildChannelApiSettings(savedConnectionState.channelApiSettings),
        );
        setAgentChannels(savedChannels);
        setPendingChannelAction(null);
        setChannelActionError(null);
        setAgentNodePosition(nextAgentNodePosition);
        setViewport(defaultViewport);
        setActiveChannelSettings(null);
        changeVersionRef.current = 0;
        setHasHydrated(true);
      } catch (error) {
        if (!shouldIgnore) {
          setSources([]);
          setPlacedSourceIds([]);
          setPlacedChannelIds([]);
          setConnectedSourceIds([]);
          setConnectedChannelIds([]);
          setNodePositions({});
          setChannelNodePositions({});
          setChannelApiSettings(buildChannelApiSettings());
          setAgentChannels([]);
          setPendingChannelAction(null);
          setChannelActionError(null);
          setAgentNodePosition(getDefaultAgentPosition());
          setViewport(defaultViewport);
          setActiveChannelSettings(null);
          setCanvasError(getErrorMessage(error));
          setSaveStatus("failed");
          setHasHydrated(true);
        }
      }
    }

    void loadCanvasState();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, agent.id, getToken, workspaceId]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const centeredViewKey = `${accountId}:${workspaceId}:${agent.id}`;

    if (centeredInitialViewKeyRef.current === centeredViewKey) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const viewportElement = viewportRef.current;

      if (!viewportElement) {
        return;
      }

      setViewport(
        getAgentCenteredViewport(
          agentNodePosition,
          viewportElement.getBoundingClientRect(),
        ),
      );
      centeredInitialViewKeyRef.current = centeredViewKey;
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [accountId, agent.id, agentNodePosition, hasHydrated, workspaceId]);

  function getCurrentConnectionState() {
    return createAgentConnectionState(
      connectedSourceIds,
      connectedChannelIds,
      placedSourceIds,
      placedChannelIds,
      nodePositions,
      agentNodePosition,
      channelNodePositions,
      channelApiSettings,
    );
  }

  function markCanvasDirty() {
    if (!hasHydrated) {
      return;
    }

    changeVersionRef.current += 1;
    setSaveStatus("dirty");
  }

  async function handleSaveCanvas() {
    if (!canSaveCanvas) {
      return;
    }

    const saveSequence = latestSaveSequenceRef.current + 1;
    const savedChangeVersion = changeVersionRef.current;

    latestSaveSequenceRef.current = saveSequence;
    setSaveStatus("saving");

    try {
      await saveRemoteAgentConnectionState(
        agent.id,
        getCurrentConnectionState(),
        { getToken, workspaceId },
      );

      if (latestSaveSequenceRef.current !== saveSequence) {
        return;
      }

      setCanvasError(null);
      setSaveStatus(
        changeVersionRef.current === savedChangeVersion ? "saved" : "dirty",
      );
    } catch (error) {
      if (latestSaveSequenceRef.current !== saveSequence) {
        return;
      }

      setCanvasError(getErrorMessage(error));
      setSaveStatus("failed");
    }
  }

  function updateChannelSettingField(
    channelId: CanvasChannelId,
    fieldKey: string,
    value: string,
  ) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    markCanvasDirty();
    setChannelApiSettings((currentSettings) => {
      const currentChannelSettings =
        currentSettings[channelId] ?? getDefaultChannelApiSettings(channelId);

      return {
        ...currentSettings,
        [channelId]: {
          ...currentChannelSettings,
          fields: {
            ...currentChannelSettings.fields,
            [fieldKey]: value,
          },
        },
      };
    });
  }

  function toggleChannelSettingEvent(
    channelId: CanvasChannelId,
    eventKey: string,
  ) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    markCanvasDirty();
    setChannelApiSettings((currentSettings) => {
      const currentChannelSettings =
        currentSettings[channelId] ?? getDefaultChannelApiSettings(channelId);
      const defaultChannelSettings = getDefaultChannelApiSettings(channelId);
      const currentValue =
        currentChannelSettings.enabledEvents[eventKey] ??
        defaultChannelSettings.enabledEvents[eventKey] ??
        false;

      return {
        ...currentSettings,
        [channelId]: {
          ...currentChannelSettings,
          enabledEvents: {
            ...currentChannelSettings.enabledEvents,
            [eventKey]: !currentValue,
          },
        },
      };
    });
  }

  function getWorldPointFromClient(clientX: number, clientY: number) {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return {
        x: 0,
        y: 0,
      };
    }

    const canvasRect = viewportElement.getBoundingClientRect();

    return {
      x: (clientX - canvasRect.left - viewport.x) / viewport.zoom,
      y: (clientY - canvasRect.top - viewport.y) / viewport.zoom,
    };
  }

  function getWorldPoint(
    event: ReactPointerEvent | CanvasWheelEvent,
  ): CanvasNodePosition {
    return getWorldPointFromClient(event.clientX, event.clientY);
  }

  function isClientPointInsideViewport(clientX: number, clientY: number) {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return false;
    }

    const viewportRect = viewportElement.getBoundingClientRect();

    return (
      clientX >= viewportRect.left &&
      clientX <= viewportRect.right &&
      clientY >= viewportRect.top &&
      clientY <= viewportRect.bottom
    );
  }

  function zoomToPoint(nextZoom: number, clientX: number, clientY: number) {
    const viewportElement = viewportRef.current;
    const safeZoom = clamp(nextZoom, minZoom, maxZoom);

    if (!viewportElement) {
      setViewport((currentViewport) => ({
        ...currentViewport,
        zoom: safeZoom,
      }));

      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();
    const worldPoint = {
      x: (clientX - viewportRect.left - viewport.x) / viewport.zoom,
      y: (clientY - viewportRect.top - viewport.y) / viewport.zoom,
    };

    setViewport({
      x: clientX - viewportRect.left - worldPoint.x * safeZoom,
      y: clientY - viewportRect.top - worldPoint.y * safeZoom,
      zoom: safeZoom,
    });
  }

  function zoomBy(delta: number) {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      setViewport((currentViewport) => ({
        ...currentViewport,
        zoom: clamp(currentViewport.zoom + delta, minZoom, maxZoom),
      }));

      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();

    zoomToPoint(
      viewport.zoom + delta,
      viewportRect.left + viewportRect.width / 2,
      viewportRect.top + viewportRect.height / 2,
    );
  }

  function resetViewport() {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      setViewport(defaultViewport);
      return;
    }

    setViewport(
      getAgentCenteredViewport(
        agentNodePosition,
        viewportElement.getBoundingClientRect(),
      ),
    );
  }

  function getChannelPosition(channelId: CanvasChannelId) {
    return (
      channelNodePositions[channelId] ??
      getDefaultChannelNodePositions(agentNodePosition)[channelId]
    );
  }

  function fitViewport(
    nextNodePositions = nodePositions,
    nextAgentNodePosition = agentNodePosition,
    nextChannelNodePositions = channelNodePositions,
  ) {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();
    const sourceBounds = placedSources.map((source, index) => {
      const position =
        nextNodePositions[source.id] ?? getDefaultNodePosition(index);

      return {
        x: position.x,
        y: position.y,
        width: sourceNodeWidth,
        height: sourceNodeHeight,
      };
    });
    const channelBounds = placedChannels.map((channel) => {
      const position =
        nextChannelNodePositions[channel.id] ?? getChannelPosition(channel.id);

      return {
        x: position.x,
        y: position.y,
        width: channelNodeWidth,
        height: channelNodeHeight,
      };
    });
    const bounds = [
      ...sourceBounds,
      ...channelBounds,
      {
        x: nextAgentNodePosition.x,
        y: nextAgentNodePosition.y,
        width: agentNodeWidth,
        height: agentNodeHeight,
      },
    ];
    const minX = Math.min(...bounds.map((bound) => bound.x));
    const minY = Math.min(...bounds.map((bound) => bound.y));
    const maxX = Math.max(
      ...bounds.map((bound) => bound.x + bound.width),
    );
    const maxY = Math.max(
      ...bounds.map((bound) => bound.y + bound.height),
    );
    const boundsWidth = Math.max(maxX - minX, 1);
    const boundsHeight = Math.max(maxY - minY, 1);
    const nextZoom = clamp(
      Math.min(
        (viewportRect.width - 96) / boundsWidth,
        (viewportRect.height - 96) / boundsHeight,
      ),
      minZoom,
      maxZoom,
    );

    setViewport({
      zoom: nextZoom,
      x: viewportRect.width / 2 - (minX + boundsWidth / 2) * nextZoom,
      y: viewportRect.height / 2 - (minY + boundsHeight / 2) * nextZoom,
    });
  }

  function autoArrangeCanvas() {
    const nextNodePositions = buildNodePositions(placedSourceIds, {});
    const nextAgentNodePosition = getDefaultAgentPosition();
    const nextChannelNodePositions = buildChannelNodePositions(
      placedChannelIds,
      {},
      nextAgentNodePosition,
    );

    setNodePositions(nextNodePositions);
    setAgentNodePosition(nextAgentNodePosition);
    setChannelNodePositions(nextChannelNodePositions);
    markCanvasDirty();
    fitViewport(
      nextNodePositions,
      nextAgentNodePosition,
      nextChannelNodePositions,
    );
  }

  function toggleConnection(sourceId: string, shouldConnect?: boolean) {
    markCanvasDirty();
    setConnectedSourceIds((currentSourceIds) => {
      const isConnected = currentSourceIds.includes(sourceId);
      const nextShouldConnect = shouldConnect ?? !isConnected;

      if (nextShouldConnect && !isConnected) {
        return [...currentSourceIds, sourceId];
      }

      if (!nextShouldConnect && isConnected) {
        return currentSourceIds.filter(
          (currentSourceId) => currentSourceId !== sourceId,
        );
      }

      return currentSourceIds;
    });
  }

  function toggleChannelConnection(
    channelId: CanvasChannelId,
    shouldConnect?: boolean,
  ) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    if (!placedChannelIdSet.has(channelId)) {
      return;
    }

    markCanvasDirty();
    setConnectedChannelIds((currentChannelIds) => {
      const isConnected = currentChannelIds.includes(channelId);
      const nextShouldConnect = shouldConnect ?? !isConnected;

      if (nextShouldConnect && !isConnected) {
        return [...currentChannelIds, channelId];
      }

      if (!nextShouldConnect && isConnected) {
        return currentChannelIds.filter(
          (currentChannelId) => currentChannelId !== channelId,
        );
      }

      return currentChannelIds;
    });
  }

  function placeSource(sourceId: string, position: CanvasNodePosition) {
    markCanvasDirty();
    setPlacedSourceIds((currentSourceIds) => {
      if (currentSourceIds.includes(sourceId)) {
        return currentSourceIds;
      }

      return [...currentSourceIds, sourceId];
    });
    setNodePositions((currentPositions) => ({
      ...currentPositions,
      [sourceId]: position,
    }));
  }

  function placeChannel(
    channelId: CanvasChannelId,
    position: CanvasNodePosition,
  ) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    markCanvasDirty();
    setPlacedChannelIds((currentChannelIds) => {
      if (currentChannelIds.includes(channelId)) {
        return currentChannelIds;
      }

      return [...currentChannelIds, channelId];
    });
    setChannelNodePositions((currentPositions) => ({
      ...currentPositions,
      [channelId]: position,
    }));
  }

  function placeSourceInViewport(sourceId: string) {
    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      placeSource(sourceId, {
        x: 120,
        y: 120,
      });

      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();
    const centerPoint = getWorldPointFromClient(
      viewportRect.left + viewportRect.width / 2,
      viewportRect.top + viewportRect.height / 2,
    );

    placeSource(sourceId, {
      x: centerPoint.x - sourceNodeWidth / 2,
      y: centerPoint.y - sourceNodeHeight / 2,
    });
  }

  function placeChannelInViewport(channelId: CanvasChannelId) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      placeChannel(channelId, {
        x: 520,
        y: 120,
      });

      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();
    const centerPoint = getWorldPointFromClient(
      viewportRect.left + viewportRect.width / 2,
      viewportRect.top + viewportRect.height / 2,
    );

    placeChannel(channelId, {
      x: centerPoint.x - channelNodeWidth / 2,
      y: centerPoint.y - channelNodeHeight / 2,
    });
  }

  function removePlacedSource(sourceId: string) {
    markCanvasDirty();
    setPlacedSourceIds((currentSourceIds) =>
      currentSourceIds.filter((currentSourceId) => currentSourceId !== sourceId),
    );
    setConnectedSourceIds((currentSourceIds) =>
      currentSourceIds.filter((currentSourceId) => currentSourceId !== sourceId),
    );
    setNodePositions((currentPositions) => {
      const nextPositions = { ...currentPositions };

      delete nextPositions[sourceId];

      return nextPositions;
    });
  }

  function removePlacedChannel(channelId: CanvasChannelId) {
    markCanvasDirty();
    setPlacedChannelIds((currentChannelIds) =>
      currentChannelIds.filter(
        (currentChannelId) => currentChannelId !== channelId,
      ),
    );
    setConnectedChannelIds((currentChannelIds) =>
      currentChannelIds.filter(
        (currentChannelId) => currentChannelId !== channelId,
      ),
    );
    setChannelNodePositions((currentPositions) => {
      const nextPositions = { ...currentPositions };

      delete nextPositions[channelId];

      return nextPositions;
    });
    setActiveChannelSettings((currentChannelId) =>
      currentChannelId === channelId ? null : currentChannelId,
    );
  }

  function openChannelSettings(channelId: CanvasChannelId) {
    if (isChannelDisabled(channelId)) {
      return;
    }

    setChannelActionError(null);
    setActiveChannelSettings(channelId);
  }

  async function handleConnectTelegramChannel(botToken: string) {
    setPendingChannelAction("telegram");

    try {
      const channel = await connectTelegramAgentChannel(agent.id, botToken, {
        getToken,
        workspaceId,
      });

      setAgentChannels((currentChannels) => {
        const otherChannels = currentChannels.filter(
          (currentChannel) => currentChannel.channelType !== channel.channelType,
        );

        return [...otherChannels, channel];
      });
      setChannelActionError(null);
    } catch (error) {
      try {
        const refreshedChannels = await fetchAgentChannels(agent.id, {
          getToken,
          workspaceId,
        });

        setAgentChannels(refreshedChannels);
      } catch {
        // Keep the original connection error visible.
      }

      setChannelActionError(getErrorMessage(error));
      throw error;
    } finally {
      setPendingChannelAction(null);
    }
  }

  async function handleDisconnectTelegramChannel() {
    setPendingChannelAction("telegram");

    try {
      await disconnectTelegramAgentChannel(agent.id, {
        getToken,
        workspaceId,
      });
      setAgentChannels((currentChannels) =>
        currentChannels.filter((channel) => channel.channelType !== "telegram"),
      );
      setChannelActionError(null);
    } catch (error) {
      setChannelActionError(getErrorMessage(error));
      throw error;
    } finally {
      setPendingChannelAction(null);
    }
  }

  function startLibrarySourceDrag(
    sourceId: string,
    event: ReactPointerEvent,
  ) {
    if (event.button !== 0 || placedSourceIdSet.has(sourceId)) {
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      type: "library-source",
      sourceId,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  function startLibraryChannelDrag(
    channelId: CanvasChannelId,
    event: ReactPointerEvent,
  ) {
    if (
      event.button !== 0 ||
      placedChannelIdSet.has(channelId) ||
      isChannelDisabled(channelId)
    ) {
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      type: "library-channel",
      channelId,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  function moveLibraryDrag(event: ReactPointerEvent) {
    if (
      dragState?.type !== "library-source" &&
      dragState?.type !== "library-channel"
    ) {
      return;
    }

    setDragState({
      ...dragState,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  function endLibraryDrag(event: ReactPointerEvent) {
    if (
      dragState?.type !== "library-source" &&
      dragState?.type !== "library-channel"
    ) {
      return;
    }

    if (isClientPointInsideViewport(event.clientX, event.clientY)) {
      const point = getWorldPointFromClient(event.clientX, event.clientY);

      if (dragState.type === "library-source") {
        placeSource(dragState.sourceId, {
          x: point.x - sourceNodeWidth / 2,
          y: point.y - sourceNodeHeight / 2,
        });
      } else {
        placeChannel(dragState.channelId, {
          x: point.x - channelNodeWidth / 2,
          y: point.y - channelNodeHeight / 2,
        });
      }
    }

    setDragState(null);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  function startNodeDrag(sourceId: string, event: ReactPointerEvent) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    viewportRef.current?.setPointerCapture(event.pointerId);

    const point = getWorldPoint(event);
    const position = nodePositions[sourceId] ?? getDefaultNodePosition(0);

    setDragState({
      type: "source",
      sourceId,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
    });
  }

  function startAgentDrag(event: ReactPointerEvent) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    viewportRef.current?.setPointerCapture(event.pointerId);

    const point = getWorldPoint(event);

    setDragState({
      type: "agent",
      offsetX: point.x - agentNodePosition.x,
      offsetY: point.y - agentNodePosition.y,
    });
  }

  function startChannelDrag(
    channelId: CanvasChannelId,
    event: ReactPointerEvent,
  ) {
    if (event.button !== 0 || isChannelDisabled(channelId)) {
      return;
    }

    event.stopPropagation();
    viewportRef.current?.setPointerCapture(event.pointerId);

    const point = getWorldPoint(event);
    const position = getChannelPosition(channelId);

    setDragState({
      type: "channel",
      channelId,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
    });
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    viewportRef.current?.setPointerCapture(event.pointerId);
    setDragState({
      type: "pan",
      startX: event.clientX,
      startY: event.clientY,
      originX: viewport.x,
      originY: viewport.y,
    });
  }

  function startConnection(sourceId: string, event: ReactPointerEvent) {
    event.stopPropagation();
    viewportRef.current?.setPointerCapture(event.pointerId);

    const position = nodePositions[sourceId] ?? getDefaultNodePosition(0);
    const point = getWorldPoint(event);

    setConnectionDraft({
      type: "source",
      sourceId,
      startPoint: {
        x: position.x + sourceNodeWidth,
        y: position.y + sourceNodeHeight / 2,
      },
      previewPoint: point,
    });
  }

  function startOutputConnection(event: ReactPointerEvent) {
    event.stopPropagation();
    viewportRef.current?.setPointerCapture(event.pointerId);

    setConnectionDraft({
      type: "channel",
      startPoint: getAgentOutputPoint(agentNodePosition),
      previewPoint: getWorldPoint(event),
    });
  }

  function getDroppedChannelId(point: CanvasNodePosition) {
    return (
      placedChannels.find((channel) => {
        const position = getChannelPosition(channel.id);

        return (
          point.x >= position.x - 40 &&
          point.x <= position.x + channelNodeWidth + 40 &&
          point.y >= position.y - 40 &&
          point.y <= position.y + channelNodeHeight + 40
        );
      })?.id ?? null
    );
  }

  function handleCanvasPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const point = getWorldPoint(event);

    if (dragState?.type === "source") {
      setNodePositions((currentPositions) => ({
        ...currentPositions,
        [dragState.sourceId]: {
          x: point.x - dragState.offsetX,
          y: point.y - dragState.offsetY,
        },
      }));
    }

    if (dragState?.type === "agent") {
      setAgentNodePosition({
        x: point.x - dragState.offsetX,
        y: point.y - dragState.offsetY,
      });
    }

    if (dragState?.type === "channel") {
      setChannelNodePositions((currentPositions) => ({
        ...currentPositions,
        [dragState.channelId]: {
          x: point.x - dragState.offsetX,
          y: point.y - dragState.offsetY,
        },
      }));
    }

    if (dragState?.type === "pan") {
      setViewport((currentViewport) => ({
        ...currentViewport,
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      }));
    }

    if (connectionDraft) {
      setConnectionDraft((currentDraft) =>
        currentDraft
          ? {
              ...currentDraft,
              previewPoint: point,
            }
          : null,
      );
    }
  }

  function handleCanvasPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const point = getWorldPoint(event);
    const droppedOnAgent =
      point.x >= agentNodePosition.x - 40 &&
      point.x <= agentNodePosition.x + agentNodeWidth + 40 &&
      point.y >= agentNodePosition.y - 40 &&
      point.y <= agentNodePosition.y + agentNodeHeight + 40;

    if (connectionDraft?.type === "source" && droppedOnAgent) {
      toggleConnection(connectionDraft.sourceId, true);
    }

    if (connectionDraft?.type === "channel") {
      const droppedChannelId = getDroppedChannelId(point);

      if (droppedChannelId) {
        toggleChannelConnection(droppedChannelId, true);
      }
    }

    if (
      dragState?.type === "source" ||
      dragState?.type === "agent" ||
      dragState?.type === "channel"
    ) {
      markCanvasDirty();
    }

    setConnectionDraft(null);
    setDragState(null);

    try {
      viewportRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  function handleCanvasWheel(event: CanvasWheelEvent) {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      zoomToPoint(
        viewport.zoom - event.deltaY * 0.0015,
        event.clientX,
        event.clientY,
      );

      return;
    }

    setViewport((currentViewport) => ({
      ...currentViewport,
      x: currentViewport.x - event.deltaX,
      y: currentViewport.y - event.deltaY,
    }));
  }

  return (
    <motion.div
      className="absolute inset-0 z-30 bg-zinc-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-connections-title"
        className="flex h-full min-h-0 flex-col overflow-hidden border border-zinc-200 bg-white shadow-sm"
        initial={{ opacity: 0, scale: 0.992 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.992 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <AgentLogo id={agent.id} name={agent.name} />

            <div className="min-w-0">
              <h2
                id="agent-connections-title"
                className="truncate text-[15px] font-semibold text-zinc-950"
              >
                {agent.name}
              </h2>
              <p className="truncate text-[12px] text-zinc-500">
                {agent.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-sm px-3 text-[12px] font-semibold"
              disabled={!canSaveCanvas}
              onClick={handleSaveCanvas}
            >
              {saveStatus === "saving" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-sm"
              aria-label="Close connections"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        {!hasHydrated ? (
          <CanvasLoadingState />
        ) : (
          <div className="grid min-h-0 flex-1 overflow-hidden bg-zinc-50 lg:grid-cols-[minmax(0,1fr)_minmax(300px,30%)]">
            <div className="relative min-h-[520px] overflow-hidden border-b border-zinc-200 lg:min-h-0 lg:border-r lg:border-b-0">
              <CanvasToolbar
                zoom={viewport.zoom}
                onZoomIn={() => zoomBy(zoomStep)}
                onZoomOut={() => zoomBy(-zoomStep)}
                onFitView={() => fitViewport()}
                onAutoArrange={autoArrangeCanvas}
                onResetView={resetViewport}
              />

              {canvasError ? (
                <div className="absolute left-4 top-16 z-20 max-w-sm rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700 shadow-sm">
                  {canvasError}
                </div>
              ) : null}

              <ChannelSettingsPanel
                channelId={activeChannelSettings}
                settings={
                  activeChannelSettings
                    ? channelApiSettings[activeChannelSettings]
                    : undefined
                }
                channelStatus={activeAgentChannel}
                isChannelActionPending={
                  pendingChannelAction === activeChannelSettings
                }
                channelActionError={channelActionError}
                onFieldChange={updateChannelSettingField}
                onToggleEvent={toggleChannelSettingEvent}
                onConnectTelegram={handleConnectTelegramChannel}
                onDisconnectTelegram={handleDisconnectTelegramChannel}
                onClose={() => setActiveChannelSettings(null)}
              />

              <div
                ref={viewportRef}
                className={cn(
                  "h-full w-full touch-none overflow-hidden",
                  dragState?.type === "pan" ? "cursor-grabbing" : "cursor-grab",
                )}
                style={{
                  backgroundImage:
                    "linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)",
                  backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
                  backgroundSize: `${gridPixelSize}px ${gridPixelSize}px`,
                }}
                onWheel={handleCanvasWheel}
                onPointerDown={startPan}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
              >
                <div
                  className="absolute left-0 top-0 h-px w-px origin-top-left overflow-visible"
                  style={{
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                  }}
                >
                  <ConnectionLayer
                    connectedSources={connectedSources}
                    connectedChannels={connectedChannels}
                    nodePositions={nodePositions}
                    channelNodePositions={channelNodePositions}
                    agentConnectionPoint={agentConnectionPoint}
                    agentOutputPoint={agentOutputPoint}
                    connectionDraft={connectionDraft}
                    onUnlinkSource={(sourceId) =>
                      toggleConnection(sourceId, false)
                    }
                    onUnlinkChannel={(channelId) =>
                      toggleChannelConnection(channelId, false)
                    }
                  />

                  {placedSources.map((source, index) => (
                    <SourceNode
                      key={source.id}
                      source={source}
                      index={index}
                      position={nodePositions[source.id]}
                      isConnected={connectedSourceIdSet.has(source.id)}
                      onDragStart={startNodeDrag}
                      onRemove={removePlacedSource}
                      onToggleConnection={toggleConnection}
                      onStartConnection={startConnection}
                    />
                  ))}

                  {placedChannels.map((channel) => (
                    <ChannelNode
                      key={channel.id}
                      channel={channel}
                      position={getChannelPosition(channel.id)}
                      isConnected={connectedChannelIdSet.has(channel.id)}
                      onDragStart={startChannelDrag}
                      onRemove={removePlacedChannel}
                      onToggleConnection={toggleChannelConnection}
                      onOpenSettings={openChannelSettings}
                    />
                  ))}

                  <AgentNode
                    agent={agent}
                    position={agentNodePosition}
                    inputCount={connectedSourceIds.length}
                    outputCount={connectedChannelIds.length}
                    onDragStart={startAgentDrag}
                    onStartOutputConnection={startOutputConnection}
                  />
                </div>
              </div>
            </div>

            <aside className="flex min-h-0 flex-col overflow-hidden bg-white">
              <ConnectionSummary
                variant="panel"
                connectedSources={connectedSources}
                connectedChannels={connectedChannels}
                onUnlinkSource={(sourceId) => toggleConnection(sourceId, false)}
                onUnlinkChannel={(channelId) =>
                  toggleChannelConnection(channelId, false)
                }
              />

              <LibraryPanel
                sourceSearch={sourceSearch}
                sources={filteredLibrarySources}
                channels={filteredLibraryChannels}
                totalAvailableCount={
                  filteredLibrarySources.length + filteredLibraryChannels.length
                }
                isLoading={false}
                onSearchChange={setSourceSearch}
                onStartSourceDrag={startLibrarySourceDrag}
                onStartChannelDrag={startLibraryChannelDrag}
                onMoveLibraryDrag={moveLibraryDrag}
                onEndLibraryDrag={endLibraryDrag}
                onPlaceSource={placeSourceInViewport}
                onPlaceChannel={placeChannelInViewport}
              />
            </aside>
          </div>
        )}
      </motion.section>

      <DragPreview dragState={dragState} source={draggedLibrarySource} />
    </motion.div>
  );
}
