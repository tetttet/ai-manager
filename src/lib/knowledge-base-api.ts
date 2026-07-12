import type {
  KnowledgeBase,
  KnowledgeSource,
  SourceFormValue,
} from "@/components/dashboard/knowledge-base-pages/source-types";
import {
  apiFetch,
  readJson,
  type WorkspaceApiRequestContext,
} from "@/lib/api-client";

type GeneralKnowledgeBaseState = {
  knowledgeBases: KnowledgeBase[];
  selectedKnowledgeBase: string | null;
  sourcesByKnowledgeBaseId: Record<string, KnowledgeSource[]>;
};

type TablesState<TTable> = {
  selectedTableId: string | null;
  tables: TTable[];
};

type ApiContext = WorkspaceApiRequestContext;

function sourcePayloadWithoutFile(source: SourceFormValue) {
  if (source.type !== "document") {
    return source;
  }

  return {
    type: source.type,
    name: source.name,
    mode: source.mode,
    fileName: source.fileName,
    fileSize: source.fileSize,
    fileType: source.fileType,
    shouldUpload: source.shouldUpload,
  };
}

function createSourceRequestBody(source: SourceFormValue) {
  if (source.type !== "document") {
    return { json: source };
  }

  const formData = new FormData();

  formData.append("payload", JSON.stringify(sourcePayloadWithoutFile(source)));

  if (source.file) {
    formData.append("file", source.file);
  }

  return { body: formData };
}

export async function fetchGeneralKnowledgeBaseState(context: ApiContext) {
  return readJson<GeneralKnowledgeBaseState>(
    await apiFetch("knowledge-base/general", {
      context,
      cache: "no-store",
    }),
  );
}

export async function createKnowledgeBase(name: string, context: ApiContext) {
  const response = await apiFetch("knowledge-base/general/knowledge-bases", {
    method: "POST",
    context,
    json: { name },
  });
  const payload = await readJson<{ knowledgeBase: KnowledgeBase }>(response);

  return payload.knowledgeBase;
}

export async function updateKnowledgeBase(
  knowledgeBaseId: string,
  name: string,
  context: ApiContext,
) {
  const response = await apiFetch(
    `knowledge-base/general/knowledge-bases/${knowledgeBaseId}`,
    {
      method: "PATCH",
      context,
      json: { name },
    },
  );
  const payload = await readJson<{ knowledgeBase: KnowledgeBase }>(response);

  return payload.knowledgeBase;
}

export async function deleteKnowledgeBase(
  knowledgeBaseId: string,
  context: ApiContext,
) {
  await readJson<void>(
    await apiFetch(
      `knowledge-base/general/knowledge-bases/${knowledgeBaseId}`,
      {
        method: "DELETE",
        context,
      },
    ),
  );
}

export async function createKnowledgeSource(
  knowledgeBaseId: string,
  source: SourceFormValue,
  context: ApiContext,
) {
  const response = await apiFetch(
    `knowledge-base/general/knowledge-bases/${knowledgeBaseId}/sources`,
    {
      method: "POST",
      context,
      ...createSourceRequestBody(source),
    },
  );
  const payload = await readJson<{ source: KnowledgeSource }>(response);

  return payload.source;
}

export async function updateKnowledgeSource(
  knowledgeBaseId: string,
  sourceId: string,
  source: SourceFormValue,
  context: ApiContext,
) {
  const response = await apiFetch(
    `knowledge-base/general/knowledge-bases/${knowledgeBaseId}/sources/${sourceId}`,
    {
      method: "PATCH",
      context,
      ...createSourceRequestBody(source),
    },
  );
  const payload = await readJson<{ source: KnowledgeSource }>(response);

  return payload.source;
}

export async function deleteKnowledgeSource(
  knowledgeBaseId: string,
  sourceId: string,
  context: ApiContext,
) {
  await readJson<void>(
    await apiFetch(
      `knowledge-base/general/knowledge-bases/${knowledgeBaseId}/sources/${sourceId}`,
      {
        method: "DELETE",
        context,
      },
    ),
  );
}

export async function deleteKnowledgeSources(
  knowledgeBaseId: string,
  sourceIds: string[],
  context: ApiContext,
) {
  await readJson<void>(
    await apiFetch(
      `knowledge-base/general/knowledge-bases/${knowledgeBaseId}/sources/delete`,
      {
        method: "POST",
        context,
        json: { ids: sourceIds },
      },
    ),
  );
}

export async function fetchKnowledgeTables<TTable>(context: ApiContext) {
  return readJson<TablesState<TTable>>(
    await apiFetch("knowledge-base/tables", {
      context,
      cache: "no-store",
    }),
  );
}

export async function createKnowledgeTable<TTable>(
  table: TTable,
  file: File,
  context: ApiContext,
) {
  const formData = new FormData();

  formData.append("payload", JSON.stringify(table));
  formData.append("file", file);

  const response = await apiFetch("knowledge-base/tables", {
    method: "POST",
    context,
    body: formData,
  });
  const payload = await readJson<{ table: TTable }>(response);

  return payload.table;
}

export async function updateKnowledgeTable<TTable extends { id: string }>(
  table: TTable,
  context: ApiContext,
) {
  const response = await apiFetch(`knowledge-base/tables/${table.id}`, {
    method: "PATCH",
    context,
    json: table,
  });
  const payload = await readJson<{ table: TTable }>(response);

  return payload.table;
}

export async function deleteKnowledgeTable(tableId: string, context: ApiContext) {
  await readJson<void>(
    await apiFetch(`knowledge-base/tables/${tableId}`, {
      method: "DELETE",
      context,
    }),
  );
}
