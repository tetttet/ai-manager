"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  CircleCheck,
  CircleX,
  Loader2,
  PencilIcon,
  RotateCw,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getSourceModeConfig, sourceTypeConfig } from "./source-options";
import type { KnowledgeSource } from "./source-types";
import { formatFileSize, getSourceSummary } from "./source-utils";

type SourcesTableProps = {
  sources: KnowledgeSource[];
  selectedSourceIds: Set<string>;
  onToggleSource: (sourceId: string) => void;
  onToggleAllSources: () => void;
  onEditSource: (source: KnowledgeSource) => void;
  onDeleteSource: (source: KnowledgeSource) => void;
  onDeleteSelectedSources: () => void;
  onRetrySource: (source: KnowledgeSource) => void;
};

function SourceStatusBadge({ source }: { source: KnowledgeSource }) {
  if (source.status === "uploading") {
    return (
      <Badge
        variant="outline"
        className="border-sky-200 bg-sky-50 text-sky-700"
      >
        <Loader2 className="animate-spin" />
        {source.type === "document" ? `${source.progress}%` : "Loading"}
      </Badge>
    );
  }

  if (source.status === "failed") {
    return (
      <Badge
        variant="outline"
        className="border-destructive/25 bg-destructive/10 text-destructive"
      >
        <CircleX />
        Failed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-emerald-200 bg-emerald-50 text-emerald-700"
    >
      <CircleCheck />
      Ready
    </Badge>
  );
}

function SourceMeta({ source }: { source: KnowledgeSource }) {
  if (source.type === "document") {
    if (source.status === "uploading") {
      return <span>{source.progress}%</span>;
    }

    return <span>{formatFileSize(source.fileSize)}</span>;
  }

  if (source.type === "website") {
    return <span>{source.domain}</span>;
  }

  if (source.type === "table") {
    return (
      <span>
        {source.table.rows.length} x {source.table.columns.length}
      </span>
    );
  }

  return <span>{source.content.length} chars</span>;
}

function SourceModeBadge({ source }: { source: KnowledgeSource }) {
  const modeConfig = getSourceModeConfig(source.mode);

  return (
    <Badge
      variant="outline"
      className={cn("rounded-sm border-none", modeConfig.badgeClassName)}
    >
      {modeConfig.label}
    </Badge>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">
        {label}
      </div>
      <div className="break-words text-xs text-foreground">{value}</div>
    </div>
  );
}

function SourceDetails({ source }: { source: KnowledgeSource }) {
  const modeConfig = getSourceModeConfig(source.mode);
  const config = sourceTypeConfig[source.type];
  const detailItems = [
    { label: "ID", value: source.id },
    { label: "Type", value: config.label },
    { label: "Mode", value: modeConfig.label },
    { label: "Created", value: formatDateTime(source.createdAt) },
    { label: "Updated", value: formatDateTime(source.updatedAt) },
  ];

  if (source.type === "website") {
    detailItems.push(
      { label: "Domain", value: source.domain },
      { label: "URL", value: source.url },
    );
  }

  if (source.type === "document") {
    detailItems.push(
      { label: "File", value: source.fileName },
      { label: "Size", value: formatFileSize(source.fileSize) },
      { label: "MIME", value: source.fileType },
      { label: "Progress", value: `${source.progress}%` },
    );

    if (source.error) {
      detailItems.push({ label: "Error", value: source.error });
    }
  }

  if (source.type === "table") {
    detailItems.push(
      { label: "Rows", value: String(source.table.rows.length) },
      { label: "Columns", value: String(source.table.columns.length) },
    );
  }

  if (source.type === "text") {
    detailItems.push({ label: "Characters", value: String(source.content.length) });
  }

  return (
    <div className="space-y-3 bg-muted/20 px-4 py-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {detailItems.map((item) => (
          <DetailItem key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      {source.type === "table" ? (
        <div className="overflow-auto rounded-sm border bg-white">
          <table className="w-full min-w-[480px] table-fixed border-collapse text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                {source.table.columns.map((column, index) => (
                  <th
                    key={`detail-column-${index}`}
                    className="border-r px-2 py-1.5 text-left font-medium last:border-r-0"
                  >
                    <span className="block truncate">{column}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {source.table.rows.slice(0, 4).map((row, rowIndex) => (
                <tr key={`detail-row-${rowIndex}`} className="border-t">
                  {source.table.columns.map((_, columnIndex) => (
                    <td
                      key={`detail-cell-${rowIndex}-${columnIndex}`}
                      className="border-r px-2 py-1.5 last:border-r-0"
                    >
                      <span className="block truncate">
                        {row[columnIndex] || "-"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {source.type === "text" ? (
        <div className="max-h-40 overflow-auto rounded-sm border bg-white px-3 py-2 text-xs whitespace-pre-wrap">
          {source.content}
        </div>
      ) : null}
    </div>
  );
}

export function SourcesTable({
  sources,
  selectedSourceIds,
  onToggleSource,
  onToggleAllSources,
  onEditSource,
  onDeleteSource,
  onDeleteSelectedSources,
  onRetrySource,
}: SourcesTableProps) {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const selectedCount = selectedSourceIds.size;
  const allSelected =
    sources.length > 0 &&
    sources.every((source) => selectedSourceIds.has(source.id));

  function toggleExpandedSource(sourceId: string) {
    setExpandedSourceId((currentSourceId) =>
      currentSourceId === sourceId ? null : sourceId,
    );
  }

  return (
    <section className="min-h-0 overflow-hidden rounded-sm border bg-white">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold tracking-normal">
            Sources
          </h3>
          <Badge variant="outline" className="rounded-full">
            {sources.length}
          </Badge>
        </div>

        {selectedCount > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="secondary" className="rounded-sm">
              {selectedCount} selected
            </Badge>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteSelectedSources}
              className="rounded-sm"
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      <div className="max-h-177 overflow-auto">
        <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-muted/50 text-muted-foreground">
            <tr className="border-b">
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all sources"
                  checked={allSelected}
                  onChange={onToggleAllSources}
                  className="size-3.5 rounded border-border"
                />
              </th>
              <th className="w-[230px] px-3 py-2 font-medium">Name</th>
              <th className="w-32 px-3 py-2 font-medium">Type</th>
              <th className="w-28 px-3 py-2 font-medium">Mode</th>
              <th className="px-3 py-2 font-medium">Content</th>
              <th className="w-28 px-3 py-2 font-medium">Meta</th>
              <th className="w-32 px-3 py-2 font-medium">Status</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="h-32 px-3 py-8 text-center text-muted-foreground"
                >
                  No sources yet.
                </td>
              </tr>
            ) : (
              sources.map((source) => {
                const config = sourceTypeConfig[source.type];
                const Icon = config.icon;
                const isSelected = selectedSourceIds.has(source.id);
                const isExpanded = expandedSourceId === source.id;

                return (
                  <Fragment key={source.id}>
                    <tr
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      className={cn(
                        "cursor-pointer border-b transition-colors outline-none hover:bg-muted/30 focus-visible:bg-muted/40",
                        isSelected && "bg-muted/50",
                        isExpanded && "bg-muted/40",
                      )}
                      onClick={() => toggleExpandedSource(source.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleExpandedSource(source.id);
                        }
                      }}
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select ${source.name}`}
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                          onChange={() => onToggleSource(source.id)}
                          className="size-3.5 rounded border-border"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex min-w-0 items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "size-3.5 shrink-0 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                          <div className="truncate font-medium">
                            {source.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-sm border-none",
                            config.badgeClassName,
                          )}
                        >
                          <Icon />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <SourceModeBadge source={source} />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="truncate text-muted-foreground">
                          {getSourceSummary(source)}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle text-muted-foreground">
                        <SourceMeta source={source} />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <SourceStatusBadge source={source} />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex justify-end gap-1">
                          {source.status === "failed" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Retry ${source.name}`}
                              className="rounded-sm text-muted-foreground"
                              onClick={(event) => {
                                event.stopPropagation();
                                onRetrySource(source);
                              }}
                            >
                              <RotateCw className="size-3.5" />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Edit ${source.name}`}
                            className="rounded-sm text-muted-foreground"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditSource(source);
                            }}
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Delete ${source.name}`}
                            className="rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteSource(source);
                            }}
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className="border-b">
                        <td colSpan={8} className="p-0">
                          <SourceDetails source={source} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
