export type SourceType = "website" | "document" | "table" | "text";

export const sourceModes = ["extra high", "high", "medium", "low"] as const;

export type SourceMode = (typeof sourceModes)[number];

export const defaultSourceMode: SourceMode = "medium";

export type SourceStatus = "ready" | "uploading" | "failed";

export type KnowledgeBase = {
  id: string;
  name: string;
};

export type TableData = {
  columns: string[];
  rows: string[][];
};

type KnowledgeSourceBase = {
  id: string;
  name: string;
  mode: SourceMode;
  status: SourceStatus;
  createdAt: string;
  updatedAt: string;
};

export type WebsiteSource = KnowledgeSourceBase & {
  type: "website";
  url: string;
  domain: string;
  status: "ready";
};

export type DocumentSource = KnowledgeSourceBase & {
  type: "document";
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  error?: string;
};

export type TableSource = KnowledgeSourceBase & {
  type: "table";
  table: TableData;
  status: "ready";
};

export type TextSource = KnowledgeSourceBase & {
  type: "text";
  content: string;
  status: "ready";
};

export type KnowledgeSource =
  | WebsiteSource
  | DocumentSource
  | TableSource
  | TextSource;

export type SourceFormValue =
  | {
      type: "website";
      name: string;
      mode: SourceMode;
      url: string;
      domain: string;
    }
  | {
      type: "document";
      name: string;
      mode: SourceMode;
      fileName: string;
      fileSize: number;
      fileType: string;
      shouldUpload: boolean;
    }
  | {
      type: "table";
      name: string;
      mode: SourceMode;
      table: TableData;
    }
  | {
      type: "text";
      name: string;
      mode: SourceMode;
      content: string;
    };

export type SourceSaveValue = SourceFormValue | SourceFormValue[];

export type SourceEditorState =
  | {
      mode: "create";
      type: SourceType;
    }
  | {
      mode: "edit";
      sourceId: string;
    };
