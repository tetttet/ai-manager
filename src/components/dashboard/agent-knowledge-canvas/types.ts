import type {
  ElementType,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from "react";

import type {
  CanvasChannelId,
  CanvasNodePosition,
} from "@/lib/agent-connections";
import type { ApiTokenProvider } from "@/lib/api-client";

export type CanvasAgent = {
  id: string;
  name: string;
  description: string;
};

export type AgentKnowledgeCanvasProps = {
  agent: CanvasAgent;
  accountId: string;
  getToken: ApiTokenProvider;
  workspaceId: string;
  onClose: () => void;
};

export type ViewportState = {
  x: number;
  y: number;
  zoom: number;
};

export type DragState =
  | {
      type: "source";
      sourceId: string;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: "agent";
      offsetX: number;
      offsetY: number;
    }
  | {
      type: "channel";
      channelId: CanvasChannelId;
      offsetX: number;
      offsetY: number;
    }
  | {
      type: "pan";
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      type: "library-source";
      sourceId: string;
      clientX: number;
      clientY: number;
    }
  | {
      type: "library-channel";
      channelId: CanvasChannelId;
      clientX: number;
      clientY: number;
    };

export type ConnectionDraft =
  | {
      type: "source";
      sourceId: string;
      startPoint: CanvasNodePosition;
      previewPoint: CanvasNodePosition;
    }
  | {
      type: "channel";
      startPoint: CanvasNodePosition;
      previewPoint: CanvasNodePosition;
    };

export type SourceTypeConfig = {
  label: string;
  icon: ElementType;
  accentClassName: string;
  badgeClassName: string;
};

export type ChannelNodeConfig = {
  id: CanvasChannelId;
  name: string;
  label: string;
  summary: string;
  disabled?: boolean;
  disabledLabel?: string;
  icon: ElementType;
  accentClassName: string;
  badgeClassName: string;
  lineColor: string;
};

export type CanvasPointerEvent = ReactPointerEvent<HTMLElement>;
export type CanvasWheelEvent = ReactWheelEvent<HTMLDivElement>;
