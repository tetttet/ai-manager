import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { GripVertical, Link2, Settings2, Unlink2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  CanvasChannelId,
  CanvasNodePosition,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { channelNodeHeight, channelNodeWidth } from "./constants";
import type { ChannelNodeConfig } from "./types";

type ChannelNodeProps = {
  channel: ChannelNodeConfig;
  position: CanvasNodePosition;
  isConnected: boolean;
  onDragStart: (channelId: CanvasChannelId, event: ReactPointerEvent) => void;
  onRemove: (channelId: CanvasChannelId) => void;
  onToggleConnection: (channelId: CanvasChannelId) => void;
  onOpenSettings: (channelId: CanvasChannelId) => void;
};

export function ChannelNode({
  channel,
  position,
  isConnected,
  onDragStart,
  onRemove,
  onToggleConnection,
  onOpenSettings,
}: ChannelNodeProps) {
  const Icon = channel.icon;
  const nodeStyle: CSSProperties = {
    left: position.x,
    top: position.y,
    width: channelNodeWidth,
    height: channelNodeHeight,
  };

  return (
    <div
      data-channel-drop={channel.id}
      className={cn(
        "absolute flex touch-none select-none flex-col overflow-hidden rounded-sm border bg-white p-3 shadow-xs transition-shadow",
        "cursor-pointer",
        isConnected
          ? "border-sky-300 shadow-sm ring-2 ring-sky-100"
          : "border-zinc-200 hover:border-zinc-300",
      )}
      style={nodeStyle}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() => onOpenSettings(channel.id)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-2 top-2 rounded-sm text-zinc-400 hover:text-red-600"
        aria-label={`Remove ${channel.name} from canvas`}
        title="Remove from canvas"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRemove(channel.id);
        }}
      >
        <X className="size-3.5" />
      </Button>

      <div className="flex min-h-0 items-start gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm border",
            channel.accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="touch-none rounded-sm text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing"
              aria-label={`Move ${channel.name}`}
              title="Move channel"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => onDragStart(channel.id, event)}
            >
              <GripVertical className="size-3.5" />
            </button>
            <h3 className="truncate text-[13px] font-semibold text-zinc-950">
              {channel.name}
            </h3>
          </div>

          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
            {channel.summary}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 pt-2">
        <button
          type="button"
          className="flex min-w-0 items-center gap-1 truncate text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onOpenSettings(channel.id);
          }}
        >
          <Settings2 className="size-3.5 shrink-0" />
          <span className="truncate">
            {isConnected ? "API ready" : "Open API settings"}
          </span>
        </button>

        <Button
          type="button"
          variant={isConnected ? "secondary" : "outline"}
          size="xs"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleConnection(channel.id);
          }}
          className="h-6 rounded-sm"
        >
          {isConnected ? (
            <Unlink2 className="size-3" />
          ) : (
            <Link2 className="size-3" />
          )}
          {isConnected ? "Unlink" : "Link bot"}
        </Button>
      </div>

      <span
        className={cn(
          "absolute -left-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border bg-white",
          isConnected
            ? "border-sky-400 text-sky-600"
            : "border-zinc-300 text-zinc-400",
        )}
      >
        <span className="size-1.5 rounded-full bg-current" />
      </span>
    </div>
  );
}
