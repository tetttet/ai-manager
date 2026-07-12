function stripTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function readApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required.");
  }

  return stripTrailingSlashes(configuredBaseUrl);
}

export const apiBaseUrl = readApiBaseUrl();

export function createApiUrl(path: string) {
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}
