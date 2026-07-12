import type {
  AgentConnectionState,
  CanvasChannelApiSettings,
  CanvasChannelId,
  CanvasNodePosition,
} from "@/lib/agent-connections";

import {
  agentNodeHeight,
  agentNodeWidth,
  channelNodeHeight,
  channelNodes,
  channelNodeWidth,
  sourceNodeHeight,
  sourceNodeWidth,
} from "./constants";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getLinePath(
  startPoint: CanvasNodePosition,
  endPoint: CanvasNodePosition,
) {
  const distance = endPoint.x - startPoint.x;
  const direction = distance < 0 ? -1 : 1;
  const curveOffset =
    direction * clamp(Math.abs(distance) * 0.45, 80, 220);

  return [
    `M ${startPoint.x} ${startPoint.y}`,
    `C ${startPoint.x + curveOffset} ${startPoint.y}`,
    `${endPoint.x - curveOffset} ${endPoint.y}`,
    `${endPoint.x} ${endPoint.y}`,
  ].join(" ");
}

export function getDefaultNodePosition(index: number): CanvasNodePosition {
  const column = index % 2;
  const row = Math.floor(index / 2);

  return {
    x: column === 0 ? 96 : 410,
    y: 108 + row * 146 + column * 36,
  };
}

export function getDefaultAgentPosition(): CanvasNodePosition {
  return {
    x: 820,
    y: 220,
  };
}

export function getDefaultChannelNodePositions(
  agentPosition = getDefaultAgentPosition(),
): Record<CanvasChannelId, CanvasNodePosition> {
  return {
    whatsapp: {
      x: agentPosition.x + agentNodeWidth + 320,
      y: agentPosition.y - 74,
    },
    telegram: {
      x: agentPosition.x + agentNodeWidth + 320,
      y: agentPosition.y + 104,
    },
  };
}

export function buildNodePositions(
  sourceIds: string[],
  storedPositions: Record<string, CanvasNodePosition>,
) {
  return sourceIds.reduce<Record<string, CanvasNodePosition>>(
    (positions, sourceId, index) => {
      positions[sourceId] =
        storedPositions[sourceId] ?? getDefaultNodePosition(index);

      return positions;
    },
    {},
  );
}

export function buildChannelNodePositions(
  channelIds: CanvasChannelId[],
  storedPositions: Partial<Record<CanvasChannelId, CanvasNodePosition>> = {},
  agentPosition = getDefaultAgentPosition(),
) {
  const defaultPositions = getDefaultChannelNodePositions(agentPosition);

  return channelNodes.reduce<Partial<Record<CanvasChannelId, CanvasNodePosition>>>(
    (positions, channel) => {
      if (!channelIds.includes(channel.id)) {
        return positions;
      }

      positions[channel.id] =
        storedPositions[channel.id] ?? defaultPositions[channel.id];

      return positions;
    },
    {},
  );
}

export function createAgentConnectionState(
  connectedSourceIds: string[],
  connectedChannelIds: CanvasChannelId[],
  placedSourceIds: string[],
  placedChannelIds: CanvasChannelId[],
  nodePositions: Record<string, CanvasNodePosition>,
  agentNodePosition: CanvasNodePosition,
  channelNodePositions: Partial<Record<CanvasChannelId, CanvasNodePosition>>,
  channelApiSettings: Partial<
    Record<CanvasChannelId, CanvasChannelApiSettings>
  >,
): AgentConnectionState {
  return {
    connectedSourceIds,
    connectedChannelIds,
    placedSourceIds,
    placedChannelIds,
    nodePositions,
    agentNodePosition,
    channelNodePositions,
    channelApiSettings,
  };
}

export function getSourceConnectionPoint(position: CanvasNodePosition) {
  return {
    x: position.x + sourceNodeWidth,
    y: position.y + sourceNodeHeight / 2,
  };
}

export function getAgentConnectionPoint(position: CanvasNodePosition) {
  return {
    x: position.x,
    y: position.y + agentNodeHeight / 2,
  };
}

export function getAgentOutputPoint(position: CanvasNodePosition) {
  return {
    x: position.x + agentNodeWidth,
    y: position.y + agentNodeHeight / 2,
  };
}

export function getChannelConnectionPoint(position: CanvasNodePosition) {
  return {
    x: position.x,
    y: position.y + channelNodeHeight / 2,
  };
}

export function getChannelBounds(position: CanvasNodePosition) {
  return {
    x: position.x,
    y: position.y,
    width: channelNodeWidth,
    height: channelNodeHeight,
  };
}
