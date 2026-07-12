import {
  apiFetch,
  readJson,
  type ApiRequestContext,
} from "@/lib/api-client";

export type WorkspaceBusinessType = "individual" | "company";

export type WorkspaceProfile = {
  goals?: string[];
  useCases?: string[];
  channels?: string[];
  currentTools?: string[];
  dataTypes?: string[];
  painPoints?: string[];
  role?: string;
  teamSize?: string;
  dataVolume?: string;
  launchTimeline?: string;
  successMetric?: string;
  sourceDetail?: string;
  notes?: string;
};

export type Workspace = {
  id: string;
  accountId: string;
  name: string;
  businessType: WorkspaceBusinessType;
  source: string;
  profile: WorkspaceProfile;
  createdAt: string;
  updatedAt: string;
};

export type WorkspacePayload = {
  name: string;
  businessType: WorkspaceBusinessType;
  source: string;
  profile: WorkspaceProfile;
};

type ApiContext = Pick<ApiRequestContext, "getToken">;

export async function fetchWorkspaces(context: ApiContext) {
  return readJson<{ workspaces: Workspace[]; selectedWorkspaceId: string | null }>(
    await apiFetch("workspaces", {
      context,
      cache: "no-store",
    }),
  );
}

export async function createWorkspace(
  payload: WorkspacePayload,
  context: ApiContext,
) {
  const response = await apiFetch("workspaces", {
    method: "POST",
    context,
    json: payload,
  });
  const data = await readJson<{ workspace: Workspace }>(response);

  return data.workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  payload: WorkspacePayload,
  context: ApiContext,
) {
  const response = await apiFetch(`workspaces/${workspaceId}`, {
    method: "PATCH",
    context,
    json: payload,
  });
  const data = await readJson<{ workspace: Workspace }>(response);

  return data.workspace;
}

export function getWorkspaceStorageKey(accountId: string) {
  return `ai-manager:active-workspace:${accountId}`;
}
