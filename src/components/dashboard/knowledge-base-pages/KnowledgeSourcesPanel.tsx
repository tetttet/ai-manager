"use client";

import { SourceActionBar } from "./SourceActionBar";
import { SourceEditorPanel } from "./SourceEditorPanel";
import { SourcesTable } from "./SourcesTable";
import { sourceTypeOrder } from "./source-options";
import type {
  KnowledgeSource,
  SourceSaveValue,
  SourceType,
} from "./source-types";

type KnowledgeSourcesPanelProps = {
  sources: KnowledgeSource[];
  selectedSourceIds: Set<string>;
  editorType: SourceType | null;
  editingSource: KnowledgeSource | null;
  onAddSource: (type: SourceType) => void;
  onCancelEditor: () => void;
  onSaveSource: (formValue: SourceSaveValue) => void;
  onToggleSource: (sourceId: string) => void;
  onToggleAllSources: () => void;
  onEditSource: (source: KnowledgeSource) => void;
  onDeleteSource: (source: KnowledgeSource) => void;
  onDeleteSelectedSources: () => void;
  onRetrySource: (source: KnowledgeSource) => void;
};

export function KnowledgeSourcesPanel({
  sources,
  selectedSourceIds,
  editorType,
  editingSource,
  onAddSource,
  onCancelEditor,
  onSaveSource,
  onToggleSource,
  onToggleAllSources,
  onEditSource,
  onDeleteSource,
  onDeleteSelectedSources,
  onRetrySource,
}: KnowledgeSourcesPanelProps) {
  const sourceCounts = sourceTypeOrder.reduce(
    (counts, type) => ({
      ...counts,
      [type]: sources.filter((source) => source.type === type).length,
    }),
    {
      website: 0,
      document: 0,
      table: 0,
      text: 0,
    },
  );
  const editorKey = editingSource
    ? `edit-${editingSource.id}`
    : editorType
      ? `create-${editorType}`
      : "closed";

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-muted/20">
      <div className="border-b bg-white px-4 py-3 sm:px-5">
        <SourceActionBar
          activeType={editorType}
          sourceCounts={sourceCounts}
          onAddSource={onAddSource}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        {editorType ? (
          <SourceEditorPanel
            key={editorKey}
            type={editorType}
            source={editingSource}
            onCancel={onCancelEditor}
            onSave={onSaveSource}
          />
        ) : null}

        <SourcesTable
          sources={sources}
          selectedSourceIds={selectedSourceIds}
          onToggleSource={onToggleSource}
          onToggleAllSources={onToggleAllSources}
          onEditSource={onEditSource}
          onDeleteSource={onDeleteSource}
          onDeleteSelectedSources={onDeleteSelectedSources}
          onRetrySource={onRetrySource}
        />
      </div>
    </main>
  );
}
