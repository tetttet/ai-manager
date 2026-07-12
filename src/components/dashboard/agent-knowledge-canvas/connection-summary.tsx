import { Unlink2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CanvasChannelId,
  CanvasKnowledgeSource,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { sourceTypeConfig } from "./constants";
import type { ChannelNodeConfig } from "./types";

type ConnectionSummaryProps = {
  connectedSources: CanvasKnowledgeSource[];
  connectedChannels: ChannelNodeConfig[];
  onUnlinkSource: (sourceId: string) => void;
  onUnlinkChannel: (channelId: CanvasChannelId) => void;
  variant?: "floating" | "panel";
};

export function ConnectionSummary({
  connectedSources,
  connectedChannels,
  onUnlinkSource,
  onUnlinkChannel,
  variant = "floating",
}: ConnectionSummaryProps) {
  return (
    <div
      className={cn(
        "border border-zinc-200 bg-white p-3",
        variant === "floating"
          ? "absolute right-4 top-4 z-20 hidden w-72 rounded-sm shadow-sm lg:block"
          : "shrink-0 border-x-0 border-t-0",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[12px] font-semibold text-zinc-950">
          Connections
        </h3>
        <Badge
          variant="outline"
          className="rounded-sm border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
        >
          {connectedSources.length + connectedChannels.length}
        </Badge>
      </div>

      <div
        className={cn(
          "mt-3 space-y-2 overflow-auto pr-1",
          variant === "floating" ? "max-h-56" : "max-h-56 lg:max-h-48",
        )}
      >
        <p className="text-[10px] font-medium uppercase text-zinc-400">
          Inputs
        </p>
        {connectedSources.length > 0 ? (
          connectedSources.map((source) => {
            const config = sourceTypeConfig[source.type];
            const Icon = config.icon;

            return (
              <div
                key={source.id}
                className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 p-2"
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-sm border",
                    config.accentClassName,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-zinc-900">
                    {source.name}
                  </p>
                  <p className="truncate text-[10px] text-zinc-500">
                    {source.knowledgeBaseName}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-sm text-zinc-500 hover:text-red-600"
                  aria-label={`Unlink ${source.name}`}
                  title="Unlink"
                  onClick={() => onUnlinkSource(source.id)}
                >
                  <Unlink2 className="size-3.5" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-[11px] leading-5 text-zinc-500">
            No connected inputs.
          </p>
        )}

        <div className="h-px bg-zinc-100" />

        <p className="text-[10px] font-medium uppercase text-zinc-400">
          Outputs
        </p>
        {connectedChannels.length > 0 ? (
          connectedChannels.map((channel) => {
            const Icon = channel.icon;

            return (
              <div
                key={channel.id}
                className="flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 p-2"
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-sm border",
                    channel.accentClassName,
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-zinc-900">
                    {channel.name}
                  </p>
                  <p className="truncate text-[10px] text-zinc-500">
                    Bot output
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-sm text-zinc-500 hover:text-red-600"
                  aria-label={`Unlink ${channel.name}`}
                  title="Unlink"
                  onClick={() => onUnlinkChannel(channel.id)}
                >
                  <Unlink2 className="size-3.5" />
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-[11px] leading-5 text-zinc-500">
            No connected outputs.
          </p>
        )}
      </div>
    </div>
  );
}
