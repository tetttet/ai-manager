import {
  Children,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Box, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CanvasChannelId,
  CanvasKnowledgeSource,
} from "@/lib/agent-connections";
import { cn } from "@/lib/utils";

import { sourceTypeConfig } from "./constants";
import type { ChannelNodeConfig } from "./types";

type LibraryPanelProps = {
  sourceSearch: string;
  sources: CanvasKnowledgeSource[];
  channels: ChannelNodeConfig[];
  totalAvailableCount: number;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStartSourceDrag: (sourceId: string, event: ReactPointerEvent) => void;
  onStartChannelDrag: (
    channelId: CanvasChannelId,
    event: ReactPointerEvent,
  ) => void;
  onMoveLibraryDrag: (event: ReactPointerEvent) => void;
  onEndLibraryDrag: (event: ReactPointerEvent) => void;
  onPlaceSource: (sourceId: string) => void;
  onPlaceChannel: (channelId: CanvasChannelId) => void;
};

export function LibraryPanel({
  sourceSearch,
  sources,
  channels,
  totalAvailableCount,
  isLoading,
  onSearchChange,
  onStartSourceDrag,
  onStartChannelDrag,
  onMoveLibraryDrag,
  onEndLibraryDrag,
  onPlaceSource,
  onPlaceChannel,
}: LibraryPanelProps) {
  return (
    <aside className="flex min-h-0 shrink-0 flex-col border-t border-zinc-200 bg-white px-3 py-2.5 lg:border-t-0">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={sourceSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              disabled={isLoading}
              placeholder="Search available blocks"
              className="h-8 rounded-sm border-zinc-200 bg-white pl-9 text-[12px]"
            />
          </div>
        </div>

        <Badge variant="outline" className="rounded-sm text-[11px]">
          {isLoading ? "Loading" : `${totalAvailableCount} available`}
        </Badge>
      </div>

      <div className="mt-2 grid min-h-0 flex-1 grid-rows-2 gap-2 overflow-hidden">
        <LibrarySection
          title="Knowledge inputs"
          emptyText="No available knowledge blocks."
        >
          {isLoading ? (
            <KnowledgeInputSkeleton />
          ) : (
            sources.map((source) => {
              const config = sourceTypeConfig[source.type];
              const Icon = config.icon;

              return (
                <div
                  key={source.id}
                  className="flex h-16 w-full shrink-0 touch-none cursor-grab select-none items-center gap-2.5 rounded-sm border border-zinc-200 bg-white p-2.5 shadow-xs hover:border-zinc-300 active:cursor-grabbing"
                  onPointerDown={(event) =>
                    onStartSourceDrag(source.id, event)
                  }
                  onPointerMove={onMoveLibraryDrag}
                  onPointerUp={onEndLibraryDrag}
                  onPointerCancel={onEndLibraryDrag}
                >
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-sm border",
                      config.accentClassName,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-[12px] font-semibold text-zinc-950">
                        {source.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 rounded-sm px-1.5 text-[10px]",
                          config.badgeClassName,
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                      {source.summary}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-400">
                      Input · {source.knowledgeBaseName}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-sm text-zinc-500"
                    aria-label={`Place ${source.name} on canvas`}
                    title="Place on canvas"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onPlaceSource(source.id)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              );
            })
          )}
        </LibrarySection>

        <LibrarySection
          title="Output channels"
          emptyText="All output channels are on the canvas."
        >
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isDisabled = Boolean(channel.disabled);

            return (
              <div
                key={channel.id}
                className={cn(
                  "flex h-16 w-full shrink-0 touch-none select-none items-center gap-2.5 rounded-sm border border-zinc-200 bg-white p-2.5 shadow-xs",
                  isDisabled
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-grab hover:border-zinc-300 active:cursor-grabbing",
                )}
                onPointerDown={(event) =>
                  isDisabled ? undefined : onStartChannelDrag(channel.id, event)
                }
                onPointerMove={isDisabled ? undefined : onMoveLibraryDrag}
                onPointerUp={isDisabled ? undefined : onEndLibraryDrag}
                onPointerCancel={isDisabled ? undefined : onEndLibraryDrag}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-sm border",
                    channel.accentClassName,
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-[12px] font-semibold text-zinc-950">
                      {channel.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 rounded-sm px-1.5 text-[10px]",
                        channel.badgeClassName,
                      )}
                    >
                      {channel.disabledLabel ?? "Output"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                    {channel.summary}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-sm text-zinc-500"
                  aria-label={`Place ${channel.name} on canvas`}
                  title="Place on canvas"
                  disabled={isDisabled}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onPlaceChannel(channel.id)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </LibrarySection>
      </div>
    </aside>
  );
}

type LibrarySectionProps = {
  title: string;
  emptyText: string;
  children: ReactNode;
};

function LibrarySection({
  title,
  emptyText,
  children,
}: LibrarySectionProps) {
  const hasChildren = Children.count(children) > 0;

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-sm border border-zinc-200 bg-zinc-50 p-2">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-zinc-500">
          <Box className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[12px] font-semibold text-zinc-950">{title}</h3>
        </div>
      </div>

      {hasChildren ? (
        <div className="flex min-h-0 flex-col gap-2 overflow-auto pr-1">
          {children}
        </div>
      ) : (
        <div className="flex h-16 items-center justify-center rounded-sm border border-dashed border-zinc-200 bg-white text-[12px] text-zinc-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function KnowledgeInputSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex h-16 w-full shrink-0 items-center gap-2.5 rounded-sm border border-zinc-200 bg-white p-2.5"
        >
          <Skeleton className="size-8 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-36" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="size-6 rounded-sm" />
        </div>
      ))}
    </>
  );
}
