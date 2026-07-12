"use client";

import type { ChangeEvent, CSSProperties, DragEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Columns3,
  Copy,
  Database,
  FileSpreadsheet,
  Layers3,
  ListFilter,
  Loader2,
  Rows3,
  SaveIcon,
  Search,
  Table2,
  Trash2Icon,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createKnowledgeTable,
  deleteKnowledgeTable,
  fetchKnowledgeTables,
  updateKnowledgeTable,
} from "@/lib/knowledge-base-api";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "../knowledge-base-pages/ConfirmDialog";

type ColumnType = "text" | "number" | "price" | "date" | "boolean";

type ImportedColumn = {
  id: string;
  name: string;
  sourceIndex: number;
  inferredType: ColumnType;
};

type ImportedRow = {
  id: string;
  cells: Record<string, string>;
};

type ImportedTable = {
  id: string;
  name: string;
  sourceFileName: string;
  sourceFileSize: number;
  sourceMimeType: string;
  sheetName: string;
  importedAt: string;
  updatedAt: string;
  groupByColumnId: string | null;
  columns: ImportedColumn[];
  rows: ImportedRow[];
  cloudinaryPublicId?: string | null;
  cloudinaryUrl?: string | null;
  cloudinaryResourceType?: string | null;
};

type SaveState = "idle" | "saving" | "saved" | "failed";

type PendingTableSave = {
  tableId: string;
  version: number;
};

type TableStats = {
  totalCells: number;
  filledCells: number;
  emptyCells: number;
  completionPercent: number;
  typeCounts: Record<ColumnType, number>;
};

const saveDelayMs = 450;
const groupNoneValue = "__none";
const previewRowLimit = 300;
const textFileExtensions = new Set(["csv", "cvs", "tsv", "txt"]);
const acceptedTableFiles = ".csv,.cvs,.tsv,.txt,.xls,.xlsx,.xlsm";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

function normalizeCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }

  return String(value).replace(/\uFEFF/g, "").trim();
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not saved";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function countDelimiterOutsideQuotes(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === delimiter && !inQuotes) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text: string) {
  const sampleLines = text
    .split(/\r\n|\n|\r/)
    .slice(0, 20)
    .filter((line) => line.trim().length > 0);
  const candidates = [",", ";", "\t", "|"];

  return candidates.reduce(
    (bestDelimiter, delimiter) => {
      const score = sampleLines.reduce(
        (total, line) => total + countDelimiterOutsideQuotes(line, delimiter),
        0,
      );

      return score > bestDelimiter.score
        ? { delimiter, score }
        : bestDelimiter;
    },
    { delimiter: ",", score: 0 },
  ).delimiter;
}

function parseDelimitedText(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === delimiter && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows;
}

function isNumberLike(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  const normalizedValue = trimmedValue
    .replace(/[$\u20ac\u00a3\u20b8\u20bd,\s]/g, "")
    .replace(/(?<=\d),(?=\d{1,2}$)/, ".");

  return /^-?\d+(\.\d+)?%?$/.test(normalizedValue);
}

function isDateLike(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || isNumberLike(trimmedValue)) {
    return false;
  }

  if (!/[./-]|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(trimmedValue)) {
    return false;
  }

  return !Number.isNaN(Date.parse(trimmedValue));
}

function isBooleanLike(value: string) {
  return /^(true|false|yes|no|y|n|0|1)$/i.test(value.trim());
}

function inferHeaderRow(rows: string[][]) {
  if (rows.length < 2) {
    return false;
  }

  const firstRow = rows[0].filter((cell) => cell.length > 0);

  if (firstRow.length === 0) {
    return false;
  }

  const normalizedHeaders = firstRow.map((cell) => cell.toLowerCase());
  const uniqueHeaders = new Set(normalizedHeaders).size;
  const textLikeCells = firstRow.filter(
    (cell) => !isNumberLike(cell) && !isDateLike(cell),
  ).length;

  return (
    uniqueHeaders >= Math.max(1, firstRow.length - 1) &&
    textLikeCells / firstRow.length >= 0.5
  );
}

function dedupeColumnName(name: string, index: number, seenNames: Map<string, number>) {
  const fallbackName = `Column ${index + 1}`;
  const baseName = name.trim() || fallbackName;
  const normalizedName = baseName.toLowerCase();
  const currentCount = seenNames.get(normalizedName) ?? 0;

  seenNames.set(normalizedName, currentCount + 1);

  return currentCount === 0 ? baseName : `${baseName} ${currentCount + 1}`;
}

function inferColumnType(label: string, values: string[]): ColumnType {
  const sampleValues = values.filter(Boolean).slice(0, 80);
  const normalizedLabel = label.toLowerCase();

  if (
    /(price|cost|amount|total|sum|\u0446\u0435\u043d\u0430|\u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c|\u0441\u0443\u043c\u043c\u0430)/i.test(normalizedLabel)
  ) {
    return "price";
  }

  if (sampleValues.length === 0) {
    return "text";
  }

  const numberCount = sampleValues.filter(isNumberLike).length;
  const dateCount = sampleValues.filter(isDateLike).length;
  const booleanCount = sampleValues.filter(isBooleanLike).length;
  const threshold = Math.max(1, Math.ceil(sampleValues.length * 0.75));

  if (dateCount >= threshold) {
    return "date";
  }

  if (booleanCount >= threshold) {
    return "boolean";
  }

  if (numberCount >= threshold) {
    return "number";
  }

  return "text";
}

function buildImportedTable({
  rawRows,
  file,
  sheetName,
  tableName,
}: {
  rawRows: unknown[][];
  file: File;
  sheetName: string;
  tableName?: string;
}): ImportedTable | null {
  const normalizedRows = rawRows
    .map((row) => row.map(normalizeCellValue))
    .filter((row) => row.some((cell) => cell.length > 0));
  const maxColumnCount = Math.max(0, ...normalizedRows.map((row) => row.length));

  if (maxColumnCount === 0) {
    return null;
  }

  const nonEmptyColumnIndexes = Array.from(
    { length: maxColumnCount },
    (_, index) => index,
  ).filter((columnIndex) =>
    normalizedRows.some((row) => (row[columnIndex] ?? "").length > 0),
  );
  const compactRows = normalizedRows.map((row) =>
    nonEmptyColumnIndexes.map((columnIndex) => row[columnIndex] ?? ""),
  );
  const usesHeaderRow = inferHeaderRow(compactRows);
  const headerValues = usesHeaderRow
    ? compactRows[0]
    : compactRows[0].map((_, index) => `Column ${index + 1}`);
  const dataRows = usesHeaderRow ? compactRows.slice(1) : compactRows;
  const tableId = createId("table");
  const seenColumnNames = new Map<string, number>();
  const columns = headerValues.map((headerValue, index) => {
    const name = dedupeColumnName(headerValue, index, seenColumnNames);

    return {
      id: `${tableId}-column-${index + 1}`,
      name,
      sourceIndex: nonEmptyColumnIndexes[index] ?? index,
      inferredType: inferColumnType(
        name,
        dataRows.map((row) => row[index] ?? ""),
      ),
    };
  });
  const rows = dataRows.map((row, rowIndex) => ({
    id: `${tableId}-row-${rowIndex + 1}`,
    cells: columns.reduce<Record<string, string>>((cells, column, columnIndex) => {
      cells[column.id] = row[columnIndex] ?? "";

      return cells;
    }, {}),
  }));
  const now = new Date().toISOString();

  return {
    id: tableId,
    name: tableName ?? getFileNameWithoutExtension(file.name),
    sourceFileName: file.name,
    sourceFileSize: file.size,
    sourceMimeType: file.type || "application/octet-stream",
    sheetName,
    importedAt: now,
    updatedAt: now,
    groupByColumnId: null,
    columns,
    rows,
  } satisfies ImportedTable;
}

async function parseSpreadsheetFile(file: File) {
  const extension = getFileExtension(file.name);

  if (textFileExtensions.has(extension)) {
    const text = await file.text();
    const delimiter = extension === "tsv" ? "\t" : detectDelimiter(text);
    const rows = parseDelimitedText(text, delimiter);
    const table = buildImportedTable({
      rawRows: rows,
      file,
      sheetName: delimiter === "\t" ? "TSV" : "CSV",
    });

    return table ? [table] : [];
  }

  const xlsx = await import("xlsx");
  const workbook = xlsx.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
  });
  const filledSheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });

    return buildImportedTable({
      rawRows: rows,
      file,
      sheetName,
      tableName:
        workbook.SheetNames.length > 1
          ? `${getFileNameWithoutExtension(file.name)} - ${sheetName}`
          : getFileNameWithoutExtension(file.name),
    });
  }).filter((table): table is ImportedTable => table !== null);

  return filledSheets;
}

function getTypeBadgeClassName(type: ColumnType) {
  if (type === "number" || type === "price") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (type === "date") {
    return "border-purple-200 bg-purple-50 text-purple-700";
  }

  if (type === "boolean") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getTableStats(table: ImportedTable): TableStats {
  const totalCells = table.rows.length * table.columns.length;
  const filledCells = table.rows.reduce(
    (filledCount, row) =>
      filledCount +
      table.columns.filter((column) => Boolean(row.cells[column.id]?.trim()))
        .length,
    0,
  );
  const typeCounts = table.columns.reduce<Record<ColumnType, number>>(
    (counts, column) => ({
      ...counts,
      [column.inferredType]: counts[column.inferredType] + 1,
    }),
    {
      text: 0,
      number: 0,
      price: 0,
      date: 0,
      boolean: 0,
    },
  );

  return {
    totalCells,
    filledCells,
    emptyCells: totalCells - filledCells,
    completionPercent:
      totalCells === 0 ? 100 : Math.round((filledCells / totalCells) * 100),
    typeCounts,
  };
}

function getTypeSummary(stats: TableStats) {
  return (Object.entries(stats.typeCounts) as [ColumnType, number][])
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${count} ${type}`)
    .join(", ");
}

function buildPersistencePayload(table: ImportedTable) {
  return {
    id: table.id,
    name: table.name,
    source: {
      fileName: table.sourceFileName,
      fileSize: table.sourceFileSize,
      mimeType: table.sourceMimeType,
      sheetName: table.sheetName,
      importedAt: table.importedAt,
      updatedAt: table.updatedAt,
    },
    schema: table.columns.map((column, index) => ({
      id: column.id,
      key: column.name.trim() || `Column ${index + 1}`,
      label: column.name.trim() || `Column ${index + 1}`,
      sourceIndex: column.sourceIndex,
      type: column.inferredType,
      order: index,
    })),
    records: table.rows.map((row, index) => ({
      id: row.id,
      order: index,
      values: table.columns.reduce<Record<string, string>>((values, column) => {
        values[column.id] = row.cells[column.id] ?? "";

        return values;
      }, {}),
    })),
    grouping: table.groupByColumnId
      ? {
          columnId: table.groupByColumnId,
          columnName:
            table.columns.find((column) => column.id === table.groupByColumnId)
              ?.name ?? null,
        }
      : null,
  };
}

function DetailMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-sm border bg-white px-3 py-2">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="truncate">{label}</span>
      </div>
      <div className="truncate text-base font-semibold tracking-normal">
        {value}
      </div>
      <div className="truncate text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function EmptyTableState({
  isDragActive,
  onUploadClick,
}: {
  isDragActive: boolean;
  onUploadClick: () => void;
}) {
  return (
    <main
      className={cn(
        "flex flex-1 items-center justify-center bg-muted/20 px-4 py-10 transition-colors sm:px-6",
        isDragActive && "bg-sky-50/70",
      )}
    >
      <section className="flex w-full max-w-xl flex-col items-center gap-4 rounded-sm border border-dashed bg-white px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full border bg-muted/30 text-muted-foreground">
          <FileSpreadsheet className="size-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-normal">
            Upload a table file
          </h2>
          <p className="text-sm text-muted-foreground">
            CSV, XLS, XLSX, TSV, or TXT
          </p>
        </div>
        <Button
          type="button"
          onClick={onUploadClick}
          className="rounded-sm bg-[#2669b3] hover:bg-[#2669b3]/90"
        >
          <Upload className="size-4" />
          Choose file
        </Button>
      </section>
    </main>
  );
}

function TableKnowledgeBasePageSkeleton() {
  return (
    <section className="flex min-h-[calc(100vh-100px)] overflow-hidden rounded-md border bg-background">
      <aside className="flex w-full shrink-0 flex-col border-b bg-white md:w-72 md:border-r md:border-b-0">
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
          <h1 className="truncate text-sm font-semibold tracking-normal">
            Tables
          </h1>
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>

        <div className="space-y-4 px-3 pb-4">
          <Skeleton className="h-8 w-full rounded-sm" />
          <Separator className="-mt-2" />
          <nav aria-label="Loading imported tables" className="space-y-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`table-nav-skeleton-${index}`}
                className="flex min-h-12 items-center gap-2 rounded-sm px-3 py-2"
              >
                <Skeleton className="size-4 shrink-0 rounded-sm" />
                <span className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 max-w-full" />
                  <Skeleton className="h-3 w-24 max-w-full" />
                </span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-2 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-8 w-full max-w-md rounded-sm" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-28 rounded-sm" />
            <Skeleton className="h-7 w-16 rounded-sm" />
            <Skeleton className="h-7 w-20 rounded-sm" />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-3 bg-muted/20 p-4 sm:p-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`table-metric-skeleton-${index}`}
                className="min-w-0 rounded-sm border bg-white px-3 py-2"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Skeleton className="size-3.5 rounded-sm" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="mt-2 h-3 w-32 max-w-full" />
              </div>
            ))}
          </section>

          <section className="rounded-sm border bg-white">
            <div className="grid gap-3 p-3 md:grid-cols-[1.2fr_0.8fr_auto_auto_auto]">
              <Skeleton className="h-8 rounded-sm" />
              <Skeleton className="h-8 rounded-sm" />
              <Skeleton className="h-8 w-36 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
              <Skeleton className="h-8 w-24 rounded-sm" />
            </div>
            <div className="grid gap-2 border-t px-3 py-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`table-meta-skeleton-${index}`}
                  className="h-3 w-full"
                />
              ))}
            </div>
          </section>

          <section className="rounded-sm border bg-white">
            <div className="flex min-h-10 items-center justify-between gap-3 border-b px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
            <div className="grid max-h-34 gap-2 overflow-hidden p-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`schema-card-skeleton-${index}`}
                  className="min-w-0 rounded-sm border bg-muted/20 px-2 py-1.5"
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <Skeleton className="h-3.5 w-28 max-w-full" />
                    <Skeleton className="h-5 w-16 rounded-sm" />
                  </div>
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))}
            </div>
          </section>

          <section className="min-h-0 overflow-hidden rounded-sm border bg-white">
            <div className="overflow-hidden">
              <div className="grid min-w-max grid-cols-[56px_repeat(5,minmax(150px,1fr))] border-b bg-muted/50 text-xs">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`table-header-skeleton-${index}`}
                    className="border-r p-2 last:border-r-0"
                  >
                    <Skeleton className="h-7 w-full rounded-sm bg-white" />
                    {index > 0 ? (
                      <Skeleton className="mt-1 h-5 w-16 rounded-sm" />
                    ) : null}
                  </div>
                ))}
              </div>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div
                  key={`table-row-skeleton-${rowIndex}`}
                  className="grid min-w-max grid-cols-[56px_repeat(5,minmax(150px,1fr))] border-b text-xs last:border-b-0"
                >
                  {Array.from({ length: 6 }).map((_, columnIndex) => (
                    <div
                      key={`table-cell-skeleton-${rowIndex}-${columnIndex}`}
                      className="border-r p-1 last:border-r-0"
                    >
                      <Skeleton className="h-7 w-full rounded-sm" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

export function TableKnowledgeBasePage() {
  const { accountId, getToken, activeWorkspaceId } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const [tables, setTables] = useState<ImportedTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pendingTableSave, setPendingTableSave] =
    useState<PendingTableSave | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [pendingDeleteTable, setPendingDeleteTable] =
    useState<ImportedTable | null>(null);
  const activeTable =
    tables.find((table) => table.id === selectedTableId) ?? tables[0] ?? null;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const gridTemplateColumns = useMemo<CSSProperties>(
    () => ({
      gridTemplateColumns: activeTable
        ? `56px repeat(${activeTable.columns.length}, minmax(150px, 1fr))`
        : "56px",
    }),
    [activeTable],
  );
  const filteredRows = useMemo(() => {
    if (!activeTable) {
      return [];
    }

    if (!normalizedSearchQuery) {
      return activeTable.rows;
    }

    return activeTable.rows.filter((row) =>
      activeTable.columns.some((column) =>
        (row.cells[column.id] ?? "")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      ),
    );
  }, [activeTable, normalizedSearchQuery]);
  const previewRows = filteredRows.slice(0, previewRowLimit);
  const matchedCellCount = useMemo(() => {
    if (!activeTable || !normalizedSearchQuery) {
      return 0;
    }

    return activeTable.rows.reduce(
      (matchCount, row) =>
        matchCount +
        activeTable.columns.filter((column) =>
          (row.cells[column.id] ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery),
        ).length,
      0,
    );
  }, [activeTable, normalizedSearchQuery]);
  const groupedPreviewRows = useMemo(() => {
    if (!activeTable?.groupByColumnId) {
      return [
        {
          key: "all",
          label: "All rows",
          rows: previewRows,
        },
      ];
    }

    const groups = new Map<string, ImportedRow[]>();

    previewRows.forEach((row) => {
      const groupValue = row.cells[activeTable.groupByColumnId ?? ""] || "Empty";
      const currentRows = groups.get(groupValue) ?? [];

      currentRows.push(row);
      groups.set(groupValue, currentRows);
    });

    return Array.from(groups.entries()).map(([label, rows]) => ({
      key: label,
      label,
      rows,
    }));
  }, [activeTable, previewRows]);
  const selectedTablePayload = activeTable
    ? buildPersistencePayload(activeTable)
    : null;
  const tableStats = activeTable ? getTableStats(activeTable) : null;
  const payloadSize = selectedTablePayload
    ? JSON.stringify(selectedTablePayload).length
    : 0;

  function requireAccountId() {
    if (accountId && activeWorkspaceId) {
      return accountId;
    }

    setParseError("Choose a workspace to save your tables.");
    return null;
  }

  useEffect(() => {
    let shouldIgnore = false;

    async function loadTables() {
      if (!accountId || !activeWorkspaceId) {
        setParseError("Choose a workspace to load your tables.");
        setSaveState("failed");
        setHasHydrated(true);
        return;
      }

      try {
        setTables([]);
        setSelectedTableId(null);
        setPendingTableSave(null);
        setPendingDeleteTable(null);
        setLastSavedAt(null);
        const state = await fetchKnowledgeTables<ImportedTable>({
          getToken,
          workspaceId: activeWorkspaceId,
        });

        if (shouldIgnore) {
          return;
        }

        setTables(state.tables);
        setSelectedTableId(state.selectedTableId ?? state.tables[0]?.id ?? null);
        setLastSavedAt(state.tables[0]?.updatedAt ?? null);
        setSaveState("saved");
      } catch (error) {
        if (!shouldIgnore) {
          setParseError(getErrorMessage(error));
          setSaveState("failed");
        }
      } finally {
        if (!shouldIgnore) {
          setHasHydrated(true);
        }
      }
    }

    void loadTables();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, activeWorkspaceId, getToken]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }

      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || pendingTableSave === null) {
      return;
    }

    if (!accountId || !activeWorkspaceId) {
      return;
    }

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    const tableToSave = tables.find(
      (table) => table.id === pendingTableSave.tableId,
    );

    if (!tableToSave) {
      return;
    }

    saveTimerRef.current = window.setTimeout(() => {
      void updateKnowledgeTable(tableToSave, {
        getToken,
        workspaceId: activeWorkspaceId,
      })
        .then((updatedTable) => {
          setTables((currentTables) =>
            currentTables.map((table) =>
              table.id === updatedTable.id ? updatedTable : table,
            ),
          );
          setLastSavedAt(updatedTable.updatedAt ?? new Date().toISOString());
          setSaveState("saved");
          setPendingTableSave((currentPendingSave) =>
            currentPendingSave?.version === pendingTableSave.version
              ? null
              : currentPendingSave,
          );
        })
        .catch((error) => {
          setParseError(getErrorMessage(error));
          setSaveState("failed");
        });
    }, saveDelayMs);
  }, [
    accountId,
    activeWorkspaceId,
    getToken,
    hasHydrated,
    pendingTableSave,
    tables,
  ]);

  function markTableDirty(tableId: string) {
    setPendingTableSave((currentPendingSave) => ({
      tableId,
      version: (currentPendingSave?.version ?? 0) + 1,
    }));
    setSaveState("saving");
  }

  function openFileDialog() {
    if (!requireAccountId()) {
      return;
    }

    if (!hasHydrated) {
      setParseError("Wait until tables finish loading.");
      return;
    }

    fileInputRef.current?.click();
  }

  async function importFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const currentAccountId = requireAccountId();

    if (!currentAccountId) {
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const file = files[0];
      const parsedTables = await parseSpreadsheetFile(file);
      const firstTable = parsedTables[0];

      if (!firstTable) {
        setParseError("No readable rows found.");
        return;
      }

      const savedTable = await createKnowledgeTable<ImportedTable>(
        firstTable,
        file,
        { getToken, workspaceId: activeWorkspaceId! },
      );

      setTables((currentTables) => [savedTable, ...currentTables]);
      setPendingTableSave(null);
      setSaveState("saved");
      setLastSavedAt(savedTable.updatedAt ?? new Date().toISOString());
      setSelectedTableId(savedTable.id);
      setSearchQuery("");
    } catch (error) {
      setParseError(getErrorMessage(error));
      setSaveState("failed");
    } finally {
      setIsParsing(false);
      setIsDragActive(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void importFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    void importFiles(Array.from(event.dataTransfer.files));
  }

  function updateActiveTable(updater: (table: ImportedTable) => ImportedTable) {
    if (!activeTable) {
      return;
    }

    markTableDirty(activeTable.id);
    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === activeTable.id
          ? updater({ ...table, updatedAt: new Date().toISOString() })
          : table,
      ),
    );
  }

  function updateTableName(value: string) {
    updateActiveTable((table) => ({
      ...table,
      name: value,
    }));
  }

  function updateGroupByColumn(value: string) {
    updateActiveTable((table) => ({
      ...table,
      groupByColumnId: value === groupNoneValue ? null : value,
    }));
  }

  function updateColumnName(columnId: string, value: string) {
    updateActiveTable((table) => ({
      ...table,
      columns: table.columns.map((column) =>
        column.id === columnId ? { ...column, name: value } : column,
      ),
    }));
  }

  function updateCell(rowId: string, columnId: string, value: string) {
    updateActiveTable((table) => ({
      ...table,
      rows: table.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              cells: {
                ...row.cells,
                [columnId]: value,
              },
            }
          : row,
      ),
    }));
  }

  function addColumn() {
    updateActiveTable((table) => {
      const columnId = `${table.id}-column-${Date.now()}`;

      return {
        ...table,
        columns: [
          ...table.columns,
          {
            id: columnId,
            name: `Column ${table.columns.length + 1}`,
            sourceIndex: table.columns.length,
            inferredType: "text",
          },
        ],
        rows: table.rows.map((row) => ({
          ...row,
          cells: {
            ...row.cells,
            [columnId]: "",
          },
        })),
      };
    });
  }

  function addRow() {
    updateActiveTable((table) => ({
      ...table,
      rows: [
        ...table.rows,
        {
          id: `${table.id}-row-${Date.now()}`,
          cells: table.columns.reduce<Record<string, string>>(
            (cells, column) => {
              cells[column.id] = "";

              return cells;
            },
            {},
          ),
        },
      ],
    }));
  }

  function openDeleteTableDialog() {
    setPendingDeleteTable(activeTable);
  }

  function closeDeleteTableDialog() {
    setPendingDeleteTable(null);
  }

  async function confirmDeleteTable() {
    if (!pendingDeleteTable) {
      return;
    }

    const deletedTableId = pendingDeleteTable.id;

    try {
      const currentAccountId = requireAccountId();

      if (!currentAccountId) {
        return;
      }

      await deleteKnowledgeTable(deletedTableId, {
        getToken,
        workspaceId: activeWorkspaceId!,
      });
      setSaveState("saved");
      setTables((currentTables) =>
        currentTables.filter((table) => table.id !== deletedTableId),
      );
      setSelectedTableId((currentTableId) =>
        currentTableId === deletedTableId ? null : currentTableId,
      );
      setPendingTableSave((currentPendingSave) =>
        currentPendingSave?.tableId === deletedTableId
          ? null
          : currentPendingSave,
      );
      setLastSavedAt(null);
      setPendingDeleteTable(null);
    } catch (error) {
      setParseError(getErrorMessage(error));
      setSaveState("failed");
    }
  }

  async function copyPayload() {
    if (!selectedTablePayload) {
      return;
    }

    await navigator.clipboard.writeText(
      JSON.stringify(selectedTablePayload, null, 2),
    );
    setCopiedPayload(true);

    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }

    copiedTimerRef.current = window.setTimeout(() => {
      setCopiedPayload(false);
    }, 1400);
  }

  if (!hasHydrated) {
    return <TableKnowledgeBasePageSkeleton />;
  }

  return (
    <section
      className="flex min-h-[calc(100vh-100px)] overflow-hidden rounded-md border bg-background"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTableFiles}
        className="sr-only"
        onChange={handleFileInputChange}
      />

      <aside className="flex w-full shrink-0 flex-col border-b bg-white md:w-72 md:border-r md:border-b-0">
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
          <h1 className="truncate text-sm font-semibold tracking-normal">
            Tables
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "rounded-sm",
              saveState === "failed"
                ? "border-destructive/25 bg-destructive/10 text-destructive"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {saveState === "saving" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SaveIcon />
            )}
            {saveState === "failed"
              ? "Save failed"
              : saveState === "saving"
                ? "Saving"
                : "Saved"}
          </Badge>
        </div>

        <div className="space-y-4 px-3 pb-4">
          <Button
            type="button"
            onClick={openFileDialog}
            disabled={isParsing || !hasHydrated || !activeWorkspaceId}
            className="h-8 w-full justify-start gap-2 rounded-sm bg-[#2669b3] hover:bg-[#2669b3]/90"
          >
            {isParsing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            <span className="truncate text-xs">
              {isParsing ? "Parsing file" : "Upload table"}
            </span>
          </Button>

          {parseError ? (
            <div className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {parseError}
            </div>
          ) : null}

          <Separator className="-mt-2" />

          <nav aria-label="Imported tables" className="space-y-1">
            {tables.length === 0 ? (
              <div className="rounded-sm border border-dashed px-3 py-4 text-xs text-muted-foreground">
                No saved tables.
              </div>
            ) : null}

            {tables.map((table) => {
              const isSelected = table.id === activeTable?.id;

              return (
                <button
                  key={table.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTableId(table.id)}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-2 rounded-sm border px-3 py-2 text-left text-xs transition-colors",
                    isSelected
                      ? "border-border bg-muted/70"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <Table2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block truncate font-medium">
                      {table.name || "Untitled table"}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {table.rows.length} rows / {table.columns.length} cols
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {activeTable ? (
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-2 sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Database className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={activeTable.name}
                aria-label="Table name"
                className="h-8 max-w-md rounded-sm border-transparent px-1 text-sm font-semibold shadow-none focus-visible:border-input"
                onChange={(event) => updateTableName(event.target.value)}
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline" className="rounded-sm">
                <Clock3 />
                {formatDateTime(lastSavedAt)}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-sm"
                onClick={() => void copyPayload()}
              >
                <Copy className="size-3.5" />
                {copiedPayload ? "Copied" : "JSON"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-sm"
                onClick={openDeleteTableDialog}
              >
                <Trash2Icon className="size-3.5" />
                Delete
              </Button>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col gap-3 bg-muted/20 p-4 sm:p-5">
            {tableStats ? (
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailMetric
                  icon={Rows3}
                  label="Rows"
                  value={String(activeTable.rows.length)}
                  detail={
                    normalizedSearchQuery
                      ? `${filteredRows.length} matching rows`
                      : `${previewRows.length} visible in preview`
                  }
                />
                <DetailMetric
                  icon={Columns3}
                  label="Columns"
                  value={String(activeTable.columns.length)}
                  detail={getTypeSummary(tableStats) || "Schema detected"}
                />
                <DetailMetric
                  icon={Database}
                  label="Completeness"
                  value={`${tableStats.completionPercent}%`}
                  detail={`${tableStats.filledCells}/${tableStats.totalCells} cells filled`}
                />
                <DetailMetric
                  icon={SaveIcon}
                  label="Payload"
                  value={formatFileSize(payloadSize)}
                  detail={`${tableStats.emptyCells} empty cells normalized`}
                />
              </section>
            ) : null}

            <section className="rounded-sm border bg-white">
              <div className="grid gap-3 p-3 md:grid-cols-[1.2fr_0.8fr_auto_auto_auto]">
                <label className="relative min-w-0">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    placeholder="Search in this table"
                    className="rounded-sm pl-8"
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>

                <div
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs",
                    normalizedSearchQuery
                      ? "border-sky-200 bg-sky-50 text-sky-700"
                      : "bg-background text-muted-foreground",
                  )}
                >
                  <Search className="size-3.5" />
                  <span className="truncate">
                    {normalizedSearchQuery
                      ? `${filteredRows.length} rows / ${matchedCellCount} cells`
                      : `${activeTable.rows.length} rows`}
                  </span>
                </div>

                <Select
                  value={activeTable.groupByColumnId ?? groupNoneValue}
                  onValueChange={updateGroupByColumn}
                >
                  <SelectTrigger className="rounded-sm">
                    <ListFilter className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={groupNoneValue}>No grouping</SelectItem>
                    {activeTable.columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.name || "Untitled column"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-sm"
                  onClick={addRow}
                >
                  <Rows3 className="size-3.5" />
                  Row
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-sm"
                  onClick={addColumn}
                >
                  <Columns3 className="size-3.5" />
                  Column
                </Button>
              </div>

              <div className="grid gap-2 border-t px-3 py-2 text-xs text-muted-foreground sm:grid-cols-4">
                <span className="flex items-center gap-1.5 truncate">
                  <FileSpreadsheet className="size-3.5" />
                  {activeTable.sourceFileName}
                </span>
                <span className="truncate">{formatFileSize(activeTable.sourceFileSize)}</span>
                <span className="truncate">Sheet: {activeTable.sheetName}</span>
                <span className="truncate">
                  Showing {previewRows.length} of {filteredRows.length} rows
                </span>
              </div>
            </section>

            <section className="rounded-sm border bg-white">
              <div className="flex min-h-10 items-center justify-between gap-3 border-b px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Columns3 className="size-4 shrink-0 text-muted-foreground" />
                  <h3 className="truncate text-sm font-semibold tracking-normal">
                    Detected schema
                  </h3>
                </div>
                <Badge variant="outline" className="rounded-sm">
                  {activeTable.columns.length} columns
                </Badge>
              </div>
              <div className="grid max-h-34 gap-2 overflow-auto p-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeTable.columns.map((column) => (
                  <div
                    key={`schema-${column.id}`}
                    className="min-w-0 rounded-sm border bg-muted/20 px-2 py-1.5"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium">
                        {column.name || "Untitled column"}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-sm border-none",
                          getTypeBadgeClassName(column.inferredType),
                        )}
                      >
                        {column.inferredType}
                      </Badge>
                    </div>
                    <div className="mt-1 truncate text-[11px] text-muted-foreground">
                      Source column {column.sourceIndex + 1}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="min-h-0 overflow-hidden rounded-sm border bg-white">
              <div className="max-h-[calc(100vh-430px)] overflow-auto">
                <div
                  className="grid min-w-max border-b bg-muted/50 text-xs text-muted-foreground"
                  style={gridTemplateColumns}
                >
                  <div className="sticky left-0 z-20 border-r bg-muted/50 px-2 py-2 text-center font-medium">
                    #
                  </div>
                  {activeTable.columns.map((column) => (
                    <div
                      key={column.id}
                      className="min-w-0 border-r p-1.5 last:border-r-0"
                    >
                      <Input
                        value={column.name}
                        aria-label={`Column ${column.sourceIndex + 1} name`}
                        className="h-7 rounded-sm bg-white text-xs font-medium"
                        onChange={(event) =>
                          updateColumnName(column.id, event.target.value)
                        }
                      />
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1 rounded-sm border-none",
                          getTypeBadgeClassName(column.inferredType),
                        )}
                      >
                        {column.inferredType}
                      </Badge>
                    </div>
                  ))}
                </div>

                {groupedPreviewRows.map((group) => (
                  <div key={group.key} className="min-w-max">
                    {activeTable.groupByColumnId ? (
                      <div
                        className="grid border-b bg-muted/30 text-xs font-medium"
                        style={gridTemplateColumns}
                      >
                        <div className="sticky left-0 z-10 border-r bg-muted/30 px-2 py-2 text-center">
                          <Layers3 className="mx-auto size-3.5 text-muted-foreground" />
                        </div>
                        <div
                          className="truncate px-3 py-2"
                          style={{ gridColumn: `span ${activeTable.columns.length}` }}
                        >
                          {group.label} - {group.rows.length}
                        </div>
                      </div>
                    ) : null}

                    {group.rows.map((row) => {
                      const absoluteRowIndex =
                        activeTable.rows.findIndex(
                          (tableRow) => tableRow.id === row.id,
                        ) + 1;

                      return (
                        <div
                          key={row.id}
                          className="grid border-b text-xs last:border-b-0 hover:bg-muted/20"
                          style={gridTemplateColumns}
                        >
                          <div className="sticky left-0 z-10 border-r bg-white px-2 py-1.5 text-center text-muted-foreground">
                            {absoluteRowIndex}
                          </div>
                          {activeTable.columns.map((column) => (
                            (() => {
                              const cellValue = row.cells[column.id] ?? "";
                              const isSearchMatch =
                                normalizedSearchQuery.length > 0 &&
                                cellValue
                                  .toLowerCase()
                                  .includes(normalizedSearchQuery);

                              return (
                                <div
                                  key={`${row.id}-${column.id}`}
                                  className={cn(
                                    "border-r p-1 last:border-r-0",
                                    isSearchMatch && "bg-sky-50",
                                  )}
                                >
                                  <Input
                                    value={cellValue}
                                    aria-label={`${column.name} row ${absoluteRowIndex}`}
                                    className={cn(
                                      "h-7 rounded-sm border-transparent bg-transparent text-xs shadow-none hover:border-input focus-visible:border-ring",
                                      isSearchMatch &&
                                        "border-sky-300 bg-white text-sky-950",
                                    )}
                                    onChange={(event) =>
                                      updateCell(
                                        row.id,
                                        column.id,
                                        event.target.value,
                                      )
                                    }
                                  />
                                </div>
                              );
                            })()
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {filteredRows.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No rows found.
                  </div>
                ) : null}

                {filteredRows.length > previewRowLimit ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Preview is limited to {previewRowLimit} rows.
                  </div>
                ) : null}
              </div>
            </section>
          </main>
        </div>
      ) : (
        <EmptyTableState
          isDragActive={isDragActive}
          onUploadClick={openFileDialog}
        />
      )}

      {isDragActive ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-sky-950/10 px-6">
          <div className="flex items-center gap-2 rounded-sm border bg-white px-4 py-3 text-sm font-medium shadow-lg">
            <Upload className="size-4 text-[#2669b3]" />
            Drop table file
          </div>
        </div>
      ) : null}

      {pendingDeleteTable ? (
        <ConfirmDialog
          title="Delete table?"
          description={
            <>
              Delete{" "}
              <span className="font-medium text-foreground">
                {pendingDeleteTable.name || "Untitled table"}
              </span>
              ? This removes {pendingDeleteTable.rows.length} rows and{" "}
              {pendingDeleteTable.columns.length} columns from saved local data.
            </>
          }
          confirmLabel="Delete"
          onCancel={closeDeleteTableDialog}
          onConfirm={confirmDeleteTable}
        />
      ) : null}
    </section>
  );
}
