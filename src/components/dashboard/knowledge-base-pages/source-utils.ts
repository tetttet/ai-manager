import type {
  KnowledgeSource,
  SourceFormValue,
  SourceStatus,
  SourceType,
  TableData,
} from "./source-types";

const supportedDocumentExtensions = new Set([
  "csv",
  "docx",
  "html",
  "json",
  "pdf",
  "txt",
]);

export function createEmptyTableData(rowCount = 3, columnCount = 3): TableData {
  const columns = Array.from(
    { length: columnCount },
    (_, index) => `Column ${index + 1}`,
  );

  return {
    columns,
    rows: Array.from({ length: rowCount }, () =>
      Array.from({ length: columnCount }, () => ""),
    ),
  };
}

export function extractDomainFromUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    const url = new URL(
      trimmedValue.startsWith("http://") ||
        trimmedValue.startsWith("https://")
        ? trimmedValue
        : `https://${trimmedValue}`,
    );

    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function getDefaultSourceName(type: SourceType) {
  if (type === "website") {
    return "Website source";
  }

  if (type === "document") {
    return "Document source";
  }

  if (type === "table") {
    return "Table source";
  }

  return "Text source";
}

export function getFileNameWithoutExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isSupportedDocument(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  return extension ? supportedDocumentExtensions.has(extension) : false;
}

export function getSourceSummary(source: KnowledgeSource) {
  if (source.type === "website") {
    return source.url;
  }

  if (source.type === "document") {
    if (source.status === "uploading") {
      return `${source.fileName} · ${source.progress}%`;
    }

    if (source.status === "failed") {
      return source.error ?? "Upload failed";
    }

    return `${source.fileName} · ${formatFileSize(source.fileSize)}`;
  }

  if (source.type === "table") {
    return `${source.table.rows.length} rows · ${source.table.columns.length} columns`;
  }

  return source.content || "Empty text source";
}

export function buildKnowledgeSource(
  formValue: SourceFormValue,
  options: {
    id: string;
    createdAt: string;
    updatedAt: string;
    previousSource?: KnowledgeSource;
  },
): KnowledgeSource {
  const name = formValue.name.trim() || getDefaultSourceName(formValue.type);

  if (formValue.type === "website") {
    return {
      id: options.id,
      type: "website",
      name,
      mode: formValue.mode,
      url: normalizeWebsiteUrl(formValue.url),
      domain: formValue.domain,
      status: "ready",
      createdAt: options.createdAt,
      updatedAt: options.updatedAt,
    };
  }

  if (formValue.type === "document") {
    const previousDocument =
      options.previousSource?.type === "document"
        ? options.previousSource
        : null;
    const status: SourceStatus = formValue.shouldUpload
      ? "uploading"
      : previousDocument?.status ?? "ready";

    return {
      id: options.id,
      type: "document",
      name,
      mode: formValue.mode,
      fileName: formValue.fileName,
      fileSize: formValue.fileSize,
      fileType: formValue.fileType,
      progress: formValue.shouldUpload ? 0 : previousDocument?.progress ?? 100,
      status,
      error: status === "failed" ? previousDocument?.error : undefined,
      createdAt: options.createdAt,
      updatedAt: options.updatedAt,
    };
  }

  if (formValue.type === "table") {
    return {
      id: options.id,
      type: "table",
      name,
      mode: formValue.mode,
      table: formValue.table,
      status: "ready",
      createdAt: options.createdAt,
      updatedAt: options.updatedAt,
    };
  }

  return {
    id: options.id,
    type: "text",
    name,
    mode: formValue.mode,
    content: formValue.content,
    status: "ready",
    createdAt: options.createdAt,
    updatedAt: options.updatedAt,
  };
}
