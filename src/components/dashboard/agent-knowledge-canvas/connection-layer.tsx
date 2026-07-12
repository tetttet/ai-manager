import { Unlink2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CanvasChannelId,
  CanvasKnowledgeSource,
  CanvasNodePosition,
} from "@/lib/agent-connections";

import {
  getChannelConnectionPoint,
  getLinePath,
  getSourceConnectionPoint,
} from "./geometry";
import type { ChannelNodeConfig, ConnectionDraft } from "./types";

type ConnectionLayerProps = {
  connectedSources: CanvasKnowledgeSource[];
  connectedChannels: ChannelNodeConfig[];
  nodePositions: Record<string, CanvasNodePosition>;
  channelNodePositions: Partial<Record<CanvasChannelId, CanvasNodePosition>>;
  agentConnectionPoint: CanvasNodePosition;
  agentOutputPoint: CanvasNodePosition;
  connectionDraft: ConnectionDraft | null;
  onUnlinkSource: (sourceId: string) => void;
  onUnlinkChannel: (channelId: CanvasChannelId) => void;
};

export function ConnectionLayer({
  connectedSources,
  connectedChannels,
  nodePositions,
  channelNodePositions,
  agentConnectionPoint,
  agentOutputPoint,
  connectionDraft,
  onUnlinkSource,
  onUnlinkChannel,
}: ConnectionLayerProps) {
  return (
    <>
      <svg
        className="absolute inset-0 overflow-visible"
        width="1"
        height="1"
        viewBox="0 0 1 1"
        aria-hidden="true"
      >
        {connectedSources.map((source) => {
          const position = nodePositions[source.id];

          if (!position) {
            return null;
          }

          const startPoint = getSourceConnectionPoint(position);
          const path = getLinePath(startPoint, agentConnectionPoint);

          return (
            <g key={source.id}>
              <path
                d={path}
                fill="none"
                stroke="#10b981"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeLinecap="round"
                strokeWidth="18"
                className="cursor-pointer"
                pointerEvents="stroke"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onUnlinkSource(source.id)}
              />
            </g>
          );
        })}

        {connectedChannels.map((channel) => {
          const position = channelNodePositions[channel.id];

          if (!position) {
            return null;
          }

          const endPoint = getChannelConnectionPoint(position);
          const path = getLinePath(agentOutputPoint, endPoint);

          return (
            <g key={channel.id}>
              <path
                d={path}
                fill="none"
                stroke={channel.lineColor}
                strokeLinecap="round"
                strokeWidth="3"
              />
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeLinecap="round"
                strokeWidth="18"
                className="cursor-pointer"
                pointerEvents="stroke"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onUnlinkChannel(channel.id)}
              />
            </g>
          );
        })}

        {connectionDraft ? (
          <path
            d={getLinePath(
              connectionDraft.startPoint,
              connectionDraft.previewPoint,
            )}
            fill="none"
            stroke="#71717a"
            strokeDasharray="8 8"
            strokeLinecap="round"
            strokeWidth="2"
          />
        ) : null}
      </svg>

      {connectedSources.map((source) => {
        const position = nodePositions[source.id];

        if (!position) {
          return null;
        }

        const startPoint = getSourceConnectionPoint(position);
        const midpoint = {
          x: (startPoint.x + agentConnectionPoint.x) / 2,
          y: (startPoint.y + agentConnectionPoint.y) / 2,
        };

        return (
          <Button
            key={`unlink-${source.id}`}
            type="button"
            variant="secondary"
            size="xs"
            className="absolute h-6 rounded-sm border border-emerald-200 bg-white text-[10px] text-emerald-700 shadow-sm hover:bg-emerald-50"
            style={{
              left: midpoint.x - 34,
              top: midpoint.y - 12,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onUnlinkSource(source.id)}
          >
            <Unlink2 className="size-3" />
            Unlink
          </Button>
        );
      })}

      {connectedChannels.map((channel) => {
        const position = channelNodePositions[channel.id];

        if (!position) {
          return null;
        }

        const endPoint = getChannelConnectionPoint(position);
        const midpoint = {
          x: (agentOutputPoint.x + endPoint.x) / 2,
          y: (agentOutputPoint.y + endPoint.y) / 2,
        };

        return (
          <Button
            key={`unlink-channel-${channel.id}`}
            type="button"
            variant="secondary"
            size="xs"
            className="absolute h-6 rounded-sm border border-sky-200 bg-white text-[10px] text-sky-700 shadow-sm hover:bg-sky-50"
            style={{
              left: midpoint.x - 34,
              top: midpoint.y - 12,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onUnlinkChannel(channel.id)}
          >
            <Unlink2 className="size-3" />
            Unlink
          </Button>
        );
      })}
    </>
  );
}
