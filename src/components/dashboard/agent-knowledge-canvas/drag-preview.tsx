import type { ReactNode } from "react";

import type {
  CanvasChannelId,
  CanvasKnowledgeSource,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { channelNodes, sourceTypeConfig } from "./constants";
import type { DragState } from "./types";

type DragPreviewProps = {
  dragState: DragState | null;
  source?: CanvasKnowledgeSource | null;
};

export function DragPreview({ dragState, source }: DragPreviewProps) {
  if (dragState?.type === "library-source" && source) {
    const config = sourceTypeConfig[source.type];
    const Icon = config.icon;

    return (
      <PreviewFrame x={dragState.clientX} y={dragState.clientY}>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm border",
            config.accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
        <PreviewText title={source.name} description={source.summary} />
      </PreviewFrame>
    );
  }

  if (dragState?.type === "library-channel") {
    const channel = getChannel(dragState.channelId);

    if (!channel) {
      return null;
    }

    const Icon = channel.icon;

    return (
      <PreviewFrame x={dragState.clientX} y={dragState.clientY}>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm border",
            channel.accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
        <PreviewText title={channel.name} description={channel.summary} />
      </PreviewFrame>
    );
  }

  return null;
}

function getChannel(channelId: CanvasChannelId) {
  return channelNodes.find((channel) => channel.id === channelId) ?? null;
}

function PreviewFrame({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: ReactNode;
}) {
  return (
    <div
      className="pointer-events-none fixed z-[60] flex w-60 items-start gap-3 rounded-sm border border-zinc-300 bg-white p-3 shadow-lg"
      style={{
        left: x + 12,
        top: y + 12,
      }}
    >
      {children}
    </div>
  );
}

function PreviewText({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[12px] font-semibold text-zinc-950">
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
        {description}
      </p>
    </div>
  );
}
