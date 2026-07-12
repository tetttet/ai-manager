import { File, Globe2, MessageCircle, Send, Table2, Type } from "lucide-react";

import type { CanvasSourceType } from "@/lib/agent-connections";

import type {
  ChannelNodeConfig,
  SourceTypeConfig,
  ViewportState,
} from "./types";

export const sourceNodeWidth = 236;
export const sourceNodeHeight = 104;
export const agentNodeWidth = 276;
export const agentNodeHeight = 158;
export const channelNodeWidth = 236;
export const channelNodeHeight = 118;
export const minZoom = 0.35;
export const maxZoom = 1.8;
export const zoomStep = 0.12;
export const gridSize = 28;

export const defaultViewport: ViewportState = {
  x: 160,
  y: 96,
  zoom: 0.88,
};

export const sourceTypeConfig: Record<CanvasSourceType, SourceTypeConfig> = {
  website: {
    label: "Website",
    icon: Globe2,
    accentClassName: "border-sky-200 bg-sky-50 text-sky-700",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  document: {
    label: "Document",
    icon: File,
    accentClassName: "border-amber-200 bg-amber-50 text-amber-700",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },
  table: {
    label: "Table",
    icon: Table2,
    accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  text: {
    label: "Text",
    icon: Type,
    accentClassName: "border-pink-200 bg-pink-50 text-pink-700",
    badgeClassName: "border-pink-200 bg-pink-50 text-pink-700",
  },
};

export const channelNodes: ChannelNodeConfig[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    label: "Test Version",
    summary: "Test Version",
    disabled: true,
    disabledLabel: "Test Version",
    icon: MessageCircle,
    accentClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    lineColor: "#059669",
  },
  {
    id: "telegram",
    name: "Telegram",
    label: "Bot output",
    summary: "Send replies through Telegram Bot API.",
    icon: Send,
    accentClassName: "border-sky-200 bg-sky-50 text-sky-700",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    lineColor: "#0284c7",
  },
];
