import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { GripVertical } from "lucide-react";

import { AgentLogo } from "@/components/dashboard/agent-logo";
import type { CanvasNodePosition } from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { agentNodeHeight, agentNodeWidth } from "./constants";
import type { CanvasAgent } from "./types";

type AgentNodeProps = {
  agent: CanvasAgent;
  position: CanvasNodePosition;
  inputCount: number;
  outputCount: number;
  onDragStart: (event: ReactPointerEvent) => void;
  onStartOutputConnection: (event: ReactPointerEvent) => void;
};

export function AgentNode({
  agent,
  position,
  inputCount,
  outputCount,
  onDragStart,
  onStartOutputConnection,
}: AgentNodeProps) {
  const nodeStyle: CSSProperties = {
    left: position.x,
    top: position.y,
    width: agentNodeWidth,
    height: agentNodeHeight,
  };

  return (
    <div
      data-agent-drop="true"
      className={cn(
        "absolute flex touch-none select-none flex-col overflow-hidden rounded-sm border border-red-100 bg-white p-4 shadow-sm ring-4 ring-red-50",
        "cursor-grab active:cursor-grabbing",
      )}
      style={nodeStyle}
      onPointerDown={onDragStart}
    >
      <div className="flex min-h-0 items-start gap-3">
        <AgentLogo id={agent.id} name={agent.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <GripVertical className="size-3.5 shrink-0 text-zinc-300" />
            <p className="text-[11px] font-medium uppercase text-zinc-400">
              Bot
            </p>
          </div>
          <h3 className="truncate text-[15px] font-semibold text-zinc-950">
            {agent.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
            {agent.description}
          </p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3">
        <div className="min-w-0">
          <span className="block truncate text-[10px] uppercase text-zinc-400">
            Inputs
          </span>
          <span className="block truncate text-[12px] font-semibold leading-4 text-zinc-950">
            {inputCount}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <span className="block truncate text-[10px] uppercase text-zinc-400">
            Outputs
          </span>
          <span className="block truncate text-[12px] font-semibold leading-4 text-zinc-950">
            {outputCount}
          </span>
        </div>
      </div>

      <span
        className="absolute -left-2 top-1/2 size-4 -translate-y-1/2 rounded-full border border-red-200 bg-red-50"
        title="Knowledge input"
      />
      <button
        type="button"
        aria-label={`Drag output from ${agent.name}`}
        title="Connect bot output"
        className="absolute -right-2 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border border-sky-300 bg-white text-sky-600 hover:border-sky-500 hover:text-sky-700"
        onPointerDown={onStartOutputConnection}
      >
        <span className="size-1.5 rounded-full bg-current" />
      </button>
    </div>
  );
}
