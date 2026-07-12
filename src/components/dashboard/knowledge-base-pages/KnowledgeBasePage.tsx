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
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createKnowledgeBase,
  createKnowledgeSource,
  deleteKnowledgeBase as deleteKnowledgeBaseRequest,
  deleteKnowledgeSources,
  fetchGeneralKnowledgeBaseState,
  updateKnowledgeBase,
  updateKnowledgeSource,
} from "@/lib/knowledge-base-api";
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

type KnowledgeBaseDialogState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      knowledgeBaseId: string;
    };

type PendingDeleteSources = {
  ids: string[];
  title: string;
  description: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function KnowledgeBasePageSkeleton() {
  return (
    <section className="flex min-h-[calc(100vh-100px)] overflow-hidden rounded-md border bg-background">
      <aside className="flex w-full shrink-0 flex-col border-b bg-white md:w-65 md:border-r md:border-b-0">
        <div className="flex h-12 shrink-0 items-center px-4">
          <h1 className="truncate text-sm font-semibold tracking-normal">
            Knowledge Bases
          </h1>
        </div>

        <div className="space-y-4 px-3 pb-4">
          <Skeleton className="h-8 w-full rounded-sm" />
          <Separator className="-mt-2" />
          <nav aria-label="Loading knowledge bases" className="space-y-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`knowledge-base-skeleton-${index}`}
                className="flex h-8 items-center gap-2 rounded-sm px-3"
              >
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="h-3.5 flex-1" />
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="h-4 w-44 max-w-full" />
            <Skeleton className="size-7 rounded-sm" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="size-8 rounded-sm" />
            <Skeleton className="size-8 rounded-sm" />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col bg-muted/20">
          <div className="border-b bg-white px-4 py-3 sm:px-5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`source-action-skeleton-${index}`}
                  className="h-8 w-28 rounded-sm"
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <section className="min-h-0 overflow-hidden rounded-sm border bg-white">
              <div className="flex min-h-11 items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-7 w-24 rounded-sm" />
              </div>

              <div className="max-h-177 overflow-hidden">
                <table className="w-full min-w-[900px] table-fixed border-collapse text-left text-xs">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <th
                          key={`source-header-skeleton-${index}`}
                          className="px-3 py-2"
                        >
                          <Skeleton className="h-3 w-full" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                      <tr
                        key={`source-row-skeleton-${rowIndex}`}
                        className="border-b"
                      >
                        {Array.from({ length: 8 }).map((_, columnIndex) => (
                          <td
                            key={`source-cell-skeleton-${rowIndex}-${columnIndex}`}
                            className="px-3 py-3"
                          >
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}

export function KnowledgeBasePage() {
  const { accountId, getToken, activeWorkspaceId } = useWorkspace();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<
    string | null
  >(null);
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
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const disabledSourceTypes = new Set<SourceType>(
    activeSources.map((source) => source.type),
  );
  const hasSelectedKnowledgeBase = activeKnowledgeBase !== null;
  const isDialogOpen = dialogState !== null;
  const dialogTitle =
    dialogState?.mode === "edit" ? "Edit knowledge base" : "New knowledge base";
  const dialogSubmitLabel = dialogState?.mode === "edit" ? "Save" : "Create";
  const isDeleteDialogOpen = pendingDeleteKnowledgeBase !== null;

  function requireAccountId() {
    if (accountId && activeWorkspaceId) {
      return accountId;
    }

    setErrorMessage("Choose a workspace to save your knowledge base.");
    return null;
  }

  const updateSourcesForKnowledgeBase = useCallback(
    (
      knowledgeBaseId: string,
      updater: (sources: KnowledgeSource[]) => KnowledgeSource[],
    ) => {
      setSourcesByKnowledgeBaseId((currentSourcesByKnowledgeBaseId) => ({
        ...currentSourcesByKnowledgeBaseId,
        [knowledgeBaseId]: updater(
          currentSourcesByKnowledgeBaseId[knowledgeBaseId] ?? [],
        ),
      }));
    },
    [],
  );

  useEffect(() => {
    let shouldIgnore = false;

    async function loadState() {
      if (!accountId || !activeWorkspaceId) {
        setErrorMessage("Choose a workspace to load your knowledge base.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setKnowledgeBases([]);
        setSelectedKnowledgeBase(null);
        setSourcesByKnowledgeBaseId({});
        setSourceEditorState(null);
        setSelectedSourceIds(new Set());
        setPendingDeleteSources(null);
        setPendingDeleteKnowledgeBase(null);
        const state = await fetchGeneralKnowledgeBaseState({
          getToken,
          workspaceId: activeWorkspaceId,
        });

        if (shouldIgnore) {
          return;
        }

        const knowledgeBaseIds = new Set(
          state.knowledgeBases.map((knowledgeBase) => knowledgeBase.id),
        );
        const nextSelectedKnowledgeBase =
          state.selectedKnowledgeBase &&
          knowledgeBaseIds.has(state.selectedKnowledgeBase)
            ? state.selectedKnowledgeBase
            : state.knowledgeBases[0]?.id ?? null;

        setKnowledgeBases(state.knowledgeBases);
        setSelectedKnowledgeBase(nextSelectedKnowledgeBase);
        setSourcesByKnowledgeBaseId(state.sourcesByKnowledgeBaseId);
        setErrorMessage(null);
      } catch (error) {
        if (!shouldIgnore) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    void loadState();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, activeWorkspaceId, getToken]);

  function openCreateKnowledgeBaseDialog() {
    if (!requireAccountId()) {
      return;
    }

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

  async function handleKnowledgeBaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = knowledgeBaseName.trim();
    const currentAccountId = requireAccountId();

    if (!name || dialogState === null || !currentAccountId) {
      return;
    }

    try {
      setErrorMessage(null);

      if (dialogState.mode === "edit") {
        const knowledgeBase = await updateKnowledgeBase(
          dialogState.knowledgeBaseId,
          name,
          { getToken, workspaceId: activeWorkspaceId! },
        );

        setKnowledgeBases((currentKnowledgeBases) =>
          currentKnowledgeBases.map((currentKnowledgeBase) =>
            currentKnowledgeBase.id === knowledgeBase.id
              ? knowledgeBase
              : currentKnowledgeBase,
          ),
        );
      } else {
        const knowledgeBase = await createKnowledgeBase(name, {
          getToken,
          workspaceId: activeWorkspaceId!,
        });

        setKnowledgeBases((currentKnowledgeBases) => [
          ...currentKnowledgeBases,
          knowledgeBase,
        ]);
        setSourcesByKnowledgeBaseId((currentSourcesByKnowledgeBaseId) => ({
          ...currentSourcesByKnowledgeBaseId,
          [knowledgeBase.id]: [],
        }));
        setSelectedKnowledgeBase(knowledgeBase.id);
      }

      closeKnowledgeBaseDialog();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function confirmDeleteKnowledgeBase() {
    if (pendingDeleteKnowledgeBase === null) {
      return;
    }

    const currentAccountId = requireAccountId();

    if (!currentAccountId) {
      return;
    }

    try {
      setErrorMessage(null);
      await deleteKnowledgeBaseRequest(pendingDeleteKnowledgeBase.id, {
        getToken,
        workspaceId: activeWorkspaceId!,
      });

      setKnowledgeBases((currentKnowledgeBases) =>
        currentKnowledgeBases.filter(
          (knowledgeBase) => knowledgeBase.id !== pendingDeleteKnowledgeBase.id,
        ),
      );
      setSourcesByKnowledgeBaseId((currentSources) => {
        const nextSources = { ...currentSources };

        delete nextSources[pendingDeleteKnowledgeBase.id];

        return nextSources;
      });
      setSelectedKnowledgeBase((currentKnowledgeBase) =>
        currentKnowledgeBase === pendingDeleteKnowledgeBase.id
          ? null
          : currentKnowledgeBase,
      );
      setSourceEditorState(null);
      setSelectedSourceIds(new Set());
      setPendingDeleteSources(null);
      closeDeleteKnowledgeBaseDialog();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function openCreateSourceEditor(type: SourceType) {
    if (!requireAccountId()) {
      return;
    }

    if (selectedKnowledgeBase === null) {
      return;
    }

    if (disabledSourceTypes.has(type)) {
      setErrorMessage("Delete the existing source of this type before adding another.");
      return;
    }

    setErrorMessage(null);
    setSourceEditorState({ mode: "create", type });
  }

  function closeSourceEditor() {
    setSourceEditorState(null);
  }

  function openEditSourceEditor(source: KnowledgeSource) {
    setSourceEditorState({ mode: "edit", sourceId: source.id });
  }

  async function handleSourceSave(saveValue: SourceSaveValue) {
    if (selectedKnowledgeBase === null) {
      return;
    }

    const currentAccountId = requireAccountId();
    const formValues = Array.isArray(saveValue) ? saveValue : [saveValue];
    const firstFormValue = formValues[0];

    if (!firstFormValue || !currentAccountId) {
      return;
    }

    try {
      setErrorMessage(null);

      if (
        sourceEditorState?.mode === "edit" &&
        editingSource !== null &&
        formValues.length === 1
      ) {
        const source = await updateKnowledgeSource(
          selectedKnowledgeBase,
          editingSource.id,
          firstFormValue,
          { getToken, workspaceId: activeWorkspaceId! },
        );

        updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) =>
          currentSources.map((currentSource) =>
            currentSource.id === source.id ? source : currentSource,
          ),
        );
      } else {
        if (disabledSourceTypes.has(firstFormValue.type)) {
          setErrorMessage(
            "Delete the existing source of this type before adding another.",
          );
          return;
        }

        const source = await createKnowledgeSource(
          selectedKnowledgeBase,
          firstFormValue,
          { getToken, workspaceId: activeWorkspaceId! },
        );

        updateSourcesForKnowledgeBase(selectedKnowledgeBase, (currentSources) => [
          source,
          ...currentSources,
        ]);
      }

      setSourceEditorState(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
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

  async function confirmDeleteSources() {
    if (selectedKnowledgeBase === null || pendingDeleteSources === null) {
      return;
    }

    const currentAccountId = requireAccountId();

    if (!currentAccountId) {
      return;
    }

    const sourceIdsToDelete = new Set(pendingDeleteSources.ids);

    try {
      setErrorMessage(null);
      await deleteKnowledgeSources(
        selectedKnowledgeBase,
        pendingDeleteSources.ids,
        { getToken, workspaceId: activeWorkspaceId! },
      );

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
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  function retrySourceUpload() {
    setErrorMessage("Open the document source and upload the file again.");
  }

  if (isLoading) {
    return <KnowledgeBasePageSkeleton />;
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
            disabled={isLoading || !activeWorkspaceId}
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

        {errorMessage ? (
          <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive sm:px-5">
            {errorMessage}
          </div>
        ) : null}

        {hasSelectedKnowledgeBase ? (
          <KnowledgeSourcesPanel
            sources={activeSources}
            selectedSourceIds={selectedSourceIds}
            editorType={activeEditorType}
            editingSource={editingSource}
            disabledSourceTypes={disabledSourceTypes}
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
                  {isLoading ? "Loading knowledge base" : "Select a knowledge base"}
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
