"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import {
  FileUp,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { sourceModeOptions, sourceTypeConfig } from "./source-options";
import { defaultSourceMode } from "./source-types";
import type {
  KnowledgeSource,
  SourceMode,
  SourceFormValue,
  SourceType,
  TableData,
} from "./source-types";
import {
  createEmptyTableData,
  extractDomainFromUrl,
  formatFileSize,
  getDefaultSourceName,
  getFileNameWithoutExtension,
} from "./source-utils";

type SourceEditorPanelProps = {
  type: SourceType;
  source: KnowledgeSource | null;
  onCancel: () => void;
  onSave: (formValue: SourceFormValue | SourceFormValue[]) => void;
};

type DocumentFileValue = {
  fileName: string;
  fileSize: number;
  fileType: string;
  file?: File;
};

function normalizeTableRows(table: TableData) {
  return table.rows.map((row) =>
    table.columns.map((_, columnIndex) => row[columnIndex] ?? ""),
  );
}

export function SourceEditorPanel({
  type,
  source,
  onCancel,
  onSave,
}: SourceEditorPanelProps) {
  const config = sourceTypeConfig[type];
  const Icon = config.icon;
  const isEditing = source !== null;
  const [name, setName] = useState(
    source?.name ?? getDefaultSourceName(type),
  );
  const [nameTouched, setNameTouched] = useState(isEditing);
  const [mode, setMode] = useState<SourceMode>(
    source?.mode ?? defaultSourceMode,
  );
  const [url, setUrl] = useState(source?.type === "website" ? source.url : "");
  const [documentFiles, setDocumentFiles] = useState<DocumentFileValue[]>(
    source?.type === "document"
      ? [
          {
            fileName: source.fileName,
            fileSize: source.fileSize,
            fileType: source.fileType,
          },
        ]
      : [],
  );
  const [documentFileChanged, setDocumentFileChanged] = useState(false);
  const [table, setTable] = useState<TableData>(
    source?.type === "table" ? source.table : createEmptyTableData(),
  );
  const [content, setContent] = useState(
    source?.type === "text" ? source.content : "",
  );
  const domain = extractDomainFromUrl(url);
  const tableGridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${table.columns.length}, minmax(120px, 1fr))`,
  };

  function handleNameChange(value: string) {
    setName(value);
    setNameTouched(true);
  }

  function handleUrlChange(value: string) {
    setUrl(value);

    if (!nameTouched) {
      setName(extractDomainFromUrl(value) || getDefaultSourceName("website"));
    }
  }

  function handleDocumentChange(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    const nextDocumentFiles = files.slice(0, 1).map((file) => ({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "application/octet-stream",
      file,
    }));

    setDocumentFiles(nextDocumentFiles);
    setDocumentFileChanged(true);

    if (!nameTouched) {
      setName(
        nextDocumentFiles.length === 1
          ? getFileNameWithoutExtension(nextDocumentFiles[0].fileName)
          : `${nextDocumentFiles.length} documents`,
      );
    }
  }

  function addTableRow() {
    setTable((currentTable) => ({
      ...currentTable,
      rows: [
        ...normalizeTableRows(currentTable),
        Array.from({ length: currentTable.columns.length }, () => ""),
      ],
    }));
  }

  function deleteTableRow(rowIndex: number) {
    setTable((currentTable) => {
      if (currentTable.rows.length <= 1) {
        return currentTable;
      }

      return {
        ...currentTable,
        rows: normalizeTableRows(currentTable).filter(
          (_, index) => index !== rowIndex,
        ),
      };
    });
  }

  function addTableColumn() {
    setTable((currentTable) => ({
      columns: [
        ...currentTable.columns,
        `Column ${currentTable.columns.length + 1}`,
      ],
      rows: normalizeTableRows(currentTable).map((row) => [...row, ""]),
    }));
  }

  function deleteTableColumn(columnIndex: number) {
    setTable((currentTable) => {
      if (currentTable.columns.length <= 1) {
        return currentTable;
      }

      return {
        columns: currentTable.columns.filter(
          (_, index) => index !== columnIndex,
        ),
        rows: normalizeTableRows(currentTable).map((row) =>
          row.filter((_, index) => index !== columnIndex),
        ),
      };
    });
  }

  function updateTableColumn(columnIndex: number, value: string) {
    setTable((currentTable) => ({
      ...currentTable,
      columns: currentTable.columns.map((column, index) =>
        index === columnIndex ? value : column,
      ),
    }));
  }

  function updateTableCell(
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) {
    setTable((currentTable) => ({
      ...currentTable,
      rows: normalizeTableRows(currentTable).map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColumnIndex) =>
              currentColumnIndex === columnIndex ? value : cell,
            )
          : row,
      ),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (type === "website") {
      if (!domain) {
        return;
      }

      onSave({
        type,
        name: name.trim() || domain,
        mode,
        url,
        domain,
      });
      return;
    }

    if (type === "document") {
      if (documentFiles.length === 0) {
        return;
      }

      const sharedName = nameTouched ? name.trim() : "";
      const documentFormValues = documentFiles.map((documentFile, index) => ({
        type,
        name:
          documentFiles.length === 1
            ? name.trim() ||
              getFileNameWithoutExtension(documentFile.fileName)
            : sharedName
              ? `${sharedName} ${index + 1}`
              : getFileNameWithoutExtension(documentFile.fileName),
        mode,
        fileName: documentFile.fileName,
        fileSize: documentFile.fileSize,
        fileType: documentFile.fileType,
        shouldUpload: documentFileChanged || !isEditing,
        file: documentFile.file,
      }));

      onSave(
        documentFormValues.length === 1
          ? documentFormValues[0]
          : documentFormValues,
      );
      return;
    }

    if (type === "table") {
      onSave({
        type,
        name: name.trim() || getDefaultSourceName(type),
        mode,
        table: {
          columns: table.columns.map((column, index) =>
            column.trim() || `Column ${index + 1}`,
          ),
          rows: normalizeTableRows(table),
        },
      });
      return;
    }

    if (!content.trim()) {
      return;
    }

    onSave({
      type,
      name: name.trim() || getDefaultSourceName(type),
      mode,
      content,
    });
  }

  const canSave =
    (type === "website" && Boolean(domain)) ||
    (type === "document" && documentFiles.length > 0) ||
    type === "table" ||
    (type === "text" && Boolean(content.trim()));
  const totalDocumentFileSize = documentFiles.reduce(
    (totalSize, documentFile) => totalSize + documentFile.fileSize,
    0,
  );

  return (
    <section className="rounded-sm border bg-white">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border",
              config.badgeClassName,
            )}
          >
            <Icon className="size-3.5" />
          </span>
          <h3 className="truncate text-sm font-semibold tracking-normal">
            {isEditing ? `Edit ${config.label}` : config.actionLabel}
          </h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close source editor"
          className="text-muted-foreground"
          onClick={onCancel}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Name
            </span>
            <Input
              value={name}
              placeholder={getDefaultSourceName(type)}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Mode
            </span>
            <Select
              value={mode}
              onValueChange={(value) => setMode(value as SourceMode)}
            >
              <SelectTrigger className="h-8 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceModeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {type === "website" ? (
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Website URL
              </span>
              <Input
                value={url}
                placeholder="https://example.com"
                onChange={(event) => handleUrlChange(event.target.value)}
              />
            </label>
          ) : null}

          {type === "document" ? (
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Document
              </span>
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-sm">
                <FileUp className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {documentFiles.length === 0
                    ? "Choose file"
                    : documentFiles.length === 1
                      ? documentFiles[0].fileName
                      : `${documentFiles.length} files selected`}
                </span>
                <input
                  type="file"
                  accept=".pdf,.html,.txt,.json,.docx,.csv"
                  className="w-24 text-xs"
                  onChange={(event) =>
                    handleDocumentChange(event.target.files)
                  }
                />
              </div>
            </label>
          ) : null}
        </div>

        {type === "website" && domain ? (
          <div className="rounded-sm border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Domain: <span className="font-medium text-foreground">{domain}</span>
          </div>
        ) : null}

        {type === "document" && documentFiles.length > 0 ? (
          <div className="space-y-1 rounded-sm border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <div>
              {documentFiles.length === 1
                ? documentFiles[0].fileName
                : `${documentFiles.length} documents`}{" "}
              · {formatFileSize(totalDocumentFileSize)}
            </div>
            {documentFiles.length > 1 ? (
              <div className="truncate">
                {documentFiles
                  .map((documentFile) => documentFile.fileName)
                  .join(", ")}
              </div>
            ) : null}
          </div>
        ) : null}

        {type === "table" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-sm"
                onClick={addTableRow}
              >
                <PlusIcon className="size-3.5" />
                Row
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-sm"
                onClick={addTableColumn}
              >
                <PlusIcon className="size-3.5" />
                Column
              </Button>
            </div>

            <div className="overflow-auto rounded-sm border">
              <div className="min-w-max">
                <div
                  className="grid border-b bg-muted/40"
                  style={tableGridStyle}
                >
                  {table.columns.map((column, columnIndex) => (
                    <div
                      key={`column-${columnIndex}`}
                      className="flex min-w-0 items-center gap-1 border-r p-1 last:border-r-0"
                    >
                      <Input
                        value={column}
                        className="h-7 rounded-sm text-xs"
                        onChange={(event) =>
                          updateTableColumn(columnIndex, event.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete column ${columnIndex + 1}`}
                        className="rounded-sm text-muted-foreground"
                        onClick={() => deleteTableColumn(columnIndex)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {normalizeTableRows(table).map((row, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="flex border-b last:border-b-0"
                  >
                    <div className="grid flex-1" style={tableGridStyle}>
                      {row.map((cell, columnIndex) => (
                        <div
                          key={`cell-${rowIndex}-${columnIndex}`}
                          className="border-r p-1 last:border-r-0"
                        >
                          <Input
                            value={cell}
                            className="h-7 rounded-sm text-xs"
                            onChange={(event) =>
                              updateTableCell(
                                rowIndex,
                                columnIndex,
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex w-9 items-center justify-center border-l bg-muted/20">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Delete row ${rowIndex + 1}`}
                        className="rounded-sm text-muted-foreground"
                        onClick={() => deleteTableRow(rowIndex)}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {type === "text" ? (
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Text
            </span>
            <textarea
              value={content}
              placeholder="Paste or write source text"
              onChange={(event) => setContent(event.target.value)}
              className="min-h-36 w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="rounded-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSave}
            className="rounded-sm bg-[#2669b3] hover:bg-[#2669b3]/90"
          >
            <SaveIcon className="size-3.5" />
            Save
          </Button>
        </div>
      </form>
    </section>
  );
}
