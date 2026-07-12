import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { GripVertical, Link2, Unlink2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CanvasKnowledgeSource,
  CanvasNodePosition,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { sourceNodeHeight, sourceNodeWidth, sourceTypeConfig } from "./constants";
import { getDefaultNodePosition } from "./geometry";

type SourceNodeProps = {
  source: CanvasKnowledgeSource;
  index: number;
  position?: CanvasNodePosition;
  isConnected: boolean;
  onDragStart: (sourceId: string, event: ReactPointerEvent) => void;
  onRemove: (sourceId: string) => void;
  onToggleConnection: (sourceId: string) => void;
  onStartConnection: (sourceId: string, event: ReactPointerEvent) => void;
};

export function SourceNode({
  source,
  index,
  position = getDefaultNodePosition(index),
  isConnected,
  onDragStart,
  onRemove,
  onToggleConnection,
  onStartConnection,
}: SourceNodeProps) {
  const config = sourceTypeConfig[source.type];
  const Icon = config.icon;
  const nodeStyle: CSSProperties = {
    left: position.x,
    top: position.y,
    width: sourceNodeWidth,
    height: sourceNodeHeight,
  };

  return (
    <div
      className={cn(
        "absolute flex touch-none select-none flex-col overflow-hidden rounded-sm border bg-white p-3 shadow-xs transition-shadow",
        "cursor-grab active:cursor-grabbing",
        isConnected
          ? "border-emerald-300 shadow-sm ring-2 ring-emerald-100"
          : "border-zinc-200 hover:border-zinc-300",
      )}
      style={nodeStyle}
      onPointerDown={(event) => onDragStart(source.id, event)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute right-2 top-2 rounded-sm text-zinc-400 hover:text-red-600"
        aria-label={`Remove ${source.name} from canvas`}
        title="Remove from canvas"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onRemove(source.id)}
      >
        <X className="size-3.5" />
      </Button>

      <div className="flex min-h-0 items-start gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm border",
            config.accentClassName,
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1 pr-5">
          <div className="flex items-center gap-1.5">
            <GripVertical className="size-3.5 shrink-0 text-zinc-300" />
            <h3 className="truncate text-[13px] font-semibold text-zinc-950">
              {source.name}
            </h3>
          </div>

          <p className="mt-1 truncate text-[11px] text-zinc-500">
            {source.summary}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "h-5 rounded-sm px-1.5 text-[10px]",
              config.badgeClassName,
            )}
          >
            {config.label}
          </Badge>
          <span className="truncate text-[10px] text-zinc-400">
            {source.knowledgeBaseName}
          </span>
        </div>

        <Button
          type="button"
          variant={isConnected ? "secondary" : "outline"}
          size="xs"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onToggleConnection(source.id)}
          className="h-6 rounded-sm"
        >
          {isConnected ? (
            <Unlink2 className="size-3" />
          ) : (
            <Link2 className="size-3" />
          )}
          {isConnected ? "Unlink" : "Link"}
        </Button>
      </div>

      <button
        type="button"
        aria-label={`Drag connection from ${source.name}`}
        className={cn(
          "absolute -right-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border bg-white",
          isConnected
            ? "border-emerald-400 text-emerald-600"
            : "border-zinc-300 text-zinc-400 hover:border-zinc-500 hover:text-zinc-700",
        )}
        onPointerDown={(event) => onStartConnection(source.id, event)}
      >
        <span className="size-1.5 rounded-full bg-current" />
      </button>
    </div>
  );
}
