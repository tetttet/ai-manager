"use client";

import {
  BookPlus,
  ChevronRight,
  Copy,
  Database,
  FileText,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "./ConfirmDialog";
import { KnowledgeSourcesPanel } from "./KnowledgeSourcesPanel";
import type {
  KnowledgeBase,
  KnowledgeSource,
  SourceEditorState,
  SourceSaveValue,
  SourceType,
} from "./source-types";
import { buildKnowledgeSource, isSupportedDocument } from "./source-utils";

type KnowledgeBaseDialogState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      knowledgeBaseId: string;
    };

const initialKnowledgeBases: KnowledgeBase[] = [
  {
    id: "knowledge-base-1",
    name: "Default Knowledge Base",
  },
];

type PendingDeleteSources = {
  ids: string[];
  title: string;
  description: string;
};

export function KnowledgeBasePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(
    initialKnowledgeBases,
  );
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<
    string | null
  >(null);
  const [nextKnowledgeBaseId, setNextKnowledgeBaseId] = useState(
    initialKnowledgeBases.length + 1,
  );
  const [dialogState, setDialogState] =
    useState<KnowledgeBaseDialogState | null>(null);
  const [pendingDeleteKnowledgeBase, setPendingDeleteKnowledgeBase] =
    useState<KnowledgeBase | null>(null);
  const [sourcesByKnowledgeBaseId, setSourcesByKnowledgeBaseId] = useState<
    Record<string, KnowledgeSource[]>
  >({});
  const [sourceEditorState, setSourceEditorState] =
    useState<SourceEditorState | null>(null);
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingDeleteSources, setPendingDeleteSources] =
    useState<PendingDeleteSources | null>(null);
  const [nextSourceId, setNextSourceId] = useState(1);
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");
  const uploadTimersRef = useRef<number[]>([]);
  const activeKnowledgeBase =
    knowledgeBases.find(
      (knowledgeBase) => knowledgeBase.id === selectedKnowledgeBase,
    ) ?? null;
  const activeSources =
    selectedKnowledgeBase === null
      ? []
      : sourcesByKnowledgeBaseId[selectedKnowledgeBase] ?? [];
  const editingSource =
    sourceEditorState?.mode === "edit"
      ? activeSources.find((source) => source.id === sourceEditorState.sourceId) ??
        null
      : null;
  const activeEditorType =
    sourceEditorState?.mode === "create"
      ? sourceEditorState.type
      : editingSource?.type ?? null;
  const hasSelectedKnowledgeBase = activeKnowledgeBase !== null;
  const isDialogOpen = dialogState !== null;
  const dialogTitle =
    dialogState?.mode === "edit" ? "Edit knowledge base" : "New knowledge base";
  const dialogSubmitLabel = dialogState?.mode === "edit" ? "Save" : "Create";
  const isDeleteDialogOpen = pendingDeleteKnowledgeBase !== null;

  useEffect(() => {
    return () => {
      uploadTimersRef.current.forEach((timer) => window.clearInterval(timer));
    };
  }, []);

  function openCreateKnowledgeBaseDialog() {
    setKnowledgeBaseName("");
    setDialogState({ mode: "create" });
  }

  function openEditKnowledgeBaseDialog(knowledgeBase: KnowledgeBase) {
    setKnowledgeBaseName(knowledgeBase.name);
    setDialogState({
      mode: "edit",
      knowledgeBaseId: knowledgeBase.id,
    });
  }

  function closeKnowledgeBaseDialog() {
    setDialogState(null);
    setKnowledgeBaseName("");
  }

  function selectKnowledgeBase(knowledgeBaseId: string) {
    setSelectedKnowledgeBase(knowledgeBaseId);
    setSourceEditorState(null);
    setSelectedSourceIds(new Set());
    setPendingDeleteSources(null);
  }

  function clearSelectedKnowledgeBase() {
    setSelectedKnowledgeBase(null);
    setSourceEditorState(null);
    setSelectedSourceIds(new Set());
    setPendingDeleteSources(null);
  }

  function openDeleteKnowledgeBaseDialog(knowledgeBase: KnowledgeBase) {
    setPendingDeleteKnowledgeBase(knowledgeBase);
  }

  function closeDeleteKnowledgeBaseDialog() {
    setPendingDeleteKnowledgeBase(null);
  }

  function deleteKnowledgeBase(knowledgeBaseId: string) {
    setKnowledgeBases((currentKnowledgeBases) =>
      currentKnowledgeBases.filter(
        (knowledgeBase) => knowledgeBase.id !== knowledgeBaseId,
      ),
    );
    setSourcesByKnowledgeBaseId((currentSources) => {
      const nextSources = { ...currentSources };

      delete nextSources[knowledgeBaseId];

      return nextSources;
    });
    setSelectedKnowledgeBase((currentKnowledgeBase) =>
      currentKnowledgeBase === knowledgeBaseId ? null : currentKnowledgeBase,
    );
    setSourceEditorState(null);
    setSelectedSourceIds(new Set());
    setPendingDeleteSources(null);
  }

  function handleKnowledgeBaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = knowledgeBaseName.trim();

    if (!name || dialogState === null) {
      return;
    }

    if (dialogState.mode === "edit") {
      setKnowledgeBases((currentKnowledgeBases) =>
        currentKnowledgeBases.map((knowledgeBase) =>
          knowledgeBase.id === dialogState.knowledgeBaseId
            ? { ...knowledgeBase, name }
            : knowledgeBase,
        ),
      );
    } else {
      const newKnowledgeBase = {
        id: `knowledge-base-${nextKnowledgeBaseId}`,
        name,
      };

      setKnowledgeBases((currentKnowledgeBases) => [
        ...currentKnowledgeBases,
        newKnowledgeBase,
      ]);
      setSelectedKnowledgeBase(newKnowledgeBase.id);
      setNextKnowledgeBaseId((currentId) => currentId + 1);
    }

    closeKnowledgeBaseDialog();
  }

  function confirmDeleteKnowledgeBase() {
    if (pendingDeleteKnowledgeBase === null) {
      return;
    }

    deleteKnowledgeBase(pendingDeleteKnowledgeBase.id);
    closeDeleteKnowledgeBaseDialog();
  }

  function updateSourcesForKnowledgeBase(
    knowledgeBaseId: string,
    updater: (sources: KnowledgeSource[]) => KnowledgeSource[],
  ) {
    setSourcesByKnowledgeBaseId((currentSourcesByKnowledgeBaseId) => ({
      ...currentSourcesByKnowledgeBaseId,
      [knowledgeBaseId]: updater(
        currentSourcesByKnowledgeBaseId[knowledgeBaseId] ?? [],
      ),
    }));
  }

  function startDocumentUpload(
    knowledgeBaseId: string,
    sourceId: string,
    shouldFail: boolean,
  ) {
    let progress = 0;

    const timer = window.setInterval(() => {
      progress = Math.min(progress + 20, 100);

      updateSourcesForKnowledgeBase(knowledgeBaseId, (currentSources) =>
        currentSources.map((source) => {
          if (source.id !== sourceId || source.type !== "document") {
            return source;
          }

          if (progress < 100) {
            return {
              ...source,
              progress,
              status: "uploading",
              updatedAt: new Date().toISOString(),
            };
          }

          return {
            ...source,
            progress: 100,
            status: shouldFail ? "failed" : "ready",
            error: shouldFail ? "Unsupported file type" : undefined,
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      if (progress >= 100) {
        window.clearInterval(timer);
        uploadTimersRef.current = uploadTimersRef.current.filter(
          (currentTimer) => currentTimer !== timer,
        );
      }
    }, 350);

    uploadTimersRef.current.push(timer);
  }

  function openCreateSourceEditor(type: SourceType) {
    if (selectedKnowledgeBase === null) {
      return;
    }

    setSourceEditorState({ mode: "create", type });
  }

  function closeSourceEditor() {
    setSourceEditorState(null);
  }

  function openEditSourceEditor(source: KnowledgeSource) {
    setSourceEditorState({ mode: "edit", sourceId: source.id });
  }

  function handleSourceSave(saveValue: SourceSaveValue) {
    if (selectedKnowledgeBase === null) {
      return;
    }

    const updatedAt = new Date().toISOString();
    const formValues = Array.isArray(saveValue) ? saveValue : [saveValue];
    const firstFormValue = formValues[0];

    if (!firstFormValue) {
      return;
    }

    if (
      sourceEditorState?.mode === "edit" &&
      editingSource !== null &&
      formValues.length === 1
    ) {
      const shouldStartUpload =
        firstFormValue.type === "document" && firstFormValue.shouldUpload;
      const shouldFailUpload =
        firstFormValue.type === "document" &&
        firstFormValue.shouldUpload &&
        !isSupportedDocument(firstFormValue.fileName);
      const updatedSource = buildKnowledgeSource(firstFormValue, {
        id: editingSource.id,
        createdAt: editingSource.createdAt,
        updatedAt,
        previousSource: editingSource,
      });

      updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) =>
        currentSources.map((source) =>
          source.id === editingSource.id ? updatedSource : source,
        ),
      );

      if (shouldStartUpload) {
        startDocumentUpload(
          selectedKnowledgeBase,
          editingSource.id,
          shouldFailUpload,
        );
      }
    } else {
      const nextSources = formValues.map((formValue, index) =>
        buildKnowledgeSource(formValue, {
          id: `source-${nextSourceId + index}`,
          createdAt: updatedAt,
          updatedAt,
        }),
      );

      setNextSourceId((currentSourceId) => currentSourceId + formValues.length);
      updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) => [
        ...nextSources,
        ...currentSources,
      ]);

      formValues.forEach((formValue, index) => {
        if (formValue.type !== "document" || !formValue.shouldUpload) {
          return;
        }

        startDocumentUpload(
          selectedKnowledgeBase,
          `source-${nextSourceId + index}`,
          !isSupportedDocument(formValue.fileName),
        );
      });
    }

    setSourceEditorState(null);
  }

  function toggleSource(sourceId: string) {
    setSelectedSourceIds((currentSourceIds) => {
      const nextSourceIds = new Set(currentSourceIds);

      if (nextSourceIds.has(sourceId)) {
        nextSourceIds.delete(sourceId);
      } else {
        nextSourceIds.add(sourceId);
      }

      return nextSourceIds;
    });
  }

  function toggleAllSources() {
    if (activeSources.length === 0) {
      return;
    }

    setSelectedSourceIds((currentSourceIds) => {
      const hasSelectedAllSources = activeSources.every((source) =>
        currentSourceIds.has(source.id),
      );

      return hasSelectedAllSources
        ? new Set()
        : new Set(activeSources.map((source) => source.id));
    });
  }

  function openDeleteSourceDialog(source: KnowledgeSource) {
    setPendingDeleteSources({
      ids: [source.id],
      title: "Delete source?",
      description: `Delete "${source.name}"? This action cannot be undone.`,
    });
  }

  function openDeleteSelectedSourcesDialog() {
    if (selectedSourceIds.size === 0) {
      return;
    }

    setPendingDeleteSources({
      ids: Array.from(selectedSourceIds),
      title: "Delete selected sources?",
      description: `Delete ${selectedSourceIds.size} selected source${
        selectedSourceIds.size === 1 ? "" : "s"
      }? This action cannot be undone.`,
    });
  }

  function confirmDeleteSources() {
    if (selectedKnowledgeBase === null || pendingDeleteSources === null) {
      return;
    }

    const sourceIdsToDelete = new Set(pendingDeleteSources.ids);

    updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) =>
      currentSources.filter((source) => !sourceIdsToDelete.has(source.id)),
    );
    setSelectedSourceIds((currentSourceIds) => {
      const nextSourceIds = new Set(currentSourceIds);

      sourceIdsToDelete.forEach((sourceId) => nextSourceIds.delete(sourceId));

      return nextSourceIds;
    });

    if (
      sourceEditorState?.mode === "edit" &&
      sourceIdsToDelete.has(sourceEditorState.sourceId)
    ) {
      setSourceEditorState(null);
    }

    setPendingDeleteSources(null);
  }

  function retrySourceUpload(source: KnowledgeSource) {
    if (selectedKnowledgeBase === null || source.type !== "document") {
      return;
    }

    updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) =>
      currentSources.map((currentSource) =>
        currentSource.id === source.id && currentSource.type === "document"
          ? {
              ...currentSource,
              progress: 0,
              status: "uploading",
              error: undefined,
              updatedAt: new Date().toISOString(),
            }
          : currentSource,
      ),
    );
    startDocumentUpload(
      selectedKnowledgeBase,
      source.id,
      !isSupportedDocument(source.fileName),
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-100px)] overflow-hidden rounded-md border bg-background">
      <aside className="flex w-full shrink-0 flex-col border-b bg-white md:w-65 md:border-r md:border-b-0">
        <div className="flex h-12 shrink-0 items-center px-4">
          <h1 className="truncate text-sm font-semibold tracking-normal">
            Knowledge Bases
          </h1>
        </div>

        <div className="space-y-4 px-3 pb-4">
          <Button
            onClick={openCreateKnowledgeBaseDialog}
            className="h-8 w-full justify-start gap-2 rounded-sm bg-[#2669b3] hover:bg-[#2669b3]/90"
          >
            <BookPlus className="size-4" />
            <span className="truncate text-xs">New Knowledge Base</span>
          </Button>

          <Separator className="-mt-2" />

          <nav aria-label="Knowledge bases" className="space-y-1">
            {knowledgeBases.map((knowledgeBase) => {
              const isSelected = knowledgeBase.id === selectedKnowledgeBase;

              return (
                <div
                  key={knowledgeBase.id}
                  className={cn(
                    "flex h-8 w-full items-center rounded-sm border text-xs transition-colors",
                    isSelected
                      ? "border-border bg-muted/70"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectKnowledgeBase(knowledgeBase.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 self-stretch px-3 text-left"
                  >
                    <Database className="size-4" />
                    <span className="truncate font-medium">
                      {knowledgeBase.name}
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`${knowledgeBase.name} actions`}
                        className="mr-1 rounded-sm text-muted-foreground"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={() =>
                          openEditKnowledgeBaseDialog(knowledgeBase)
                        }
                        className="text-[13px]"
                      >
                        <PencilIcon className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          openDeleteKnowledgeBaseDialog(knowledgeBase)
                        }
                        className="text-[13px]"
                      >
                        <Trash2Icon className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold">
              {activeKnowledgeBase?.name ?? "Select a knowledge base"}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy knowledge base"
              disabled={!hasSelectedKnowledgeBase}
              className="shrink-0 text-muted-foreground"
            >
              <Copy className="size-4" />
            </Button>
          </div>

          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open documentation"
              className="text-muted-foreground"
            >
              <FileText className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close knowledge base"
              disabled={!hasSelectedKnowledgeBase}
              onClick={clearSelectedKnowledgeBase}
              className="text-muted-foreground"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </header>

        {hasSelectedKnowledgeBase ? (
          <KnowledgeSourcesPanel
            sources={activeSources}
            selectedSourceIds={selectedSourceIds}
            editorType={activeEditorType}
            editingSource={editingSource}
            onAddSource={openCreateSourceEditor}
            onCancelEditor={closeSourceEditor}
            onSaveSource={handleSourceSave}
            onToggleSource={toggleSource}
            onToggleAllSources={toggleAllSources}
            onEditSource={openEditSourceEditor}
            onDeleteSource={openDeleteSourceDialog}
            onDeleteSelectedSources={openDeleteSelectedSourcesDialog}
            onRetrySource={retrySourceUpload}
          />
        ) : (
          <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-10 sm:px-6">
            <Card className="relative w-full max-w-3xl items-center gap-3 border-none p-6 text-center shadow-none sm:p-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-normal">
                  Select a knowledge base
                </h3>
              </div>
            </Card>
          </main>
        )}
      </div>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6"
          onMouseDown={closeKnowledgeBaseDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="knowledge-base-dialog-title"
            className="w-full max-w-sm rounded-sm border bg-white p-4 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="knowledge-base-dialog-title"
                className="text-sm font-semibold tracking-normal"
              >
                {dialogTitle}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close dialog"
                className="text-muted-foreground"
                onClick={closeKnowledgeBaseDialog}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleKnowledgeBaseSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="knowledge-base-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Name
                </label>
                <Input
                  id="knowledge-base-name"
                  autoFocus
                  value={knowledgeBaseName}
                  placeholder="Knowledge base name"
                  onChange={(event) => setKnowledgeBaseName(event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeKnowledgeBaseDialog}
                  className="rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!knowledgeBaseName.trim()}
                  className="bg-[#2669b3] hover:bg-[#2669b3]/90 rounded-sm"
                >
                  {dialogSubmitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isDeleteDialogOpen ? (
        <ConfirmDialog
          title="Delete knowledge base?"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {pendingDeleteKnowledgeBase.name}
              </span>
              ? This action cannot be undone.
            </>
          }
          confirmLabel="Delete"
          onCancel={closeDeleteKnowledgeBaseDialog}
          onConfirm={confirmDeleteKnowledgeBase}
        />
      ) : null}

      {pendingDeleteSources ? (
        <ConfirmDialog
          title={pendingDeleteSources.title}
          description={pendingDeleteSources.description}
          confirmLabel="Delete"
          onCancel={() => setPendingDeleteSources(null)}
          onConfirm={confirmDeleteSources}
        />
      ) : null}
    </section>
  );
}
