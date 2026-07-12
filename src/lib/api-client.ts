import { createApiUrl } from "@/lib/api-config";

export type ApiTokenProvider = () => Promise<string | null>;

export type ApiRequestContext = {
  getToken: ApiTokenProvider;
  workspaceId?: string;
};

export type WorkspaceApiRequestContext = ApiRequestContext & {
  workspaceId: string;
};

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  context: ApiRequestContext;
  body?: BodyInit | null;
  headers?: HeadersInit;
  json?: unknown;
};

export async function readJson<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  let message = "Request failed.";

  try {
    const payload = (await response.json()) as { message?: string };

    if (payload.message) {
      message = payload.message;
    }
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

async function createAuthHeaders(
  context: ApiRequestContext,
  headers?: HeadersInit,
) {
  const requestHeaders = new Headers(headers);
  const token = await context.getToken();

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  requestHeaders.set("Authorization", `Bearer ${token}`);

  if (context.workspaceId) {
    requestHeaders.set("X-AI-Manager-Workspace-Id", context.workspaceId);
  }

  return requestHeaders;
}

export async function apiFetch(path: string, options: ApiFetchOptions) {
  const { context, headers, json, body, ...init } = options;
  const requestHeaders = await createAuthHeaders(context, headers);
  let requestBody = body;

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(json);
  }

  return fetch(createApiUrl(path), {
    ...init,
    headers: requestHeaders,
    body: requestBody,
  });
}
