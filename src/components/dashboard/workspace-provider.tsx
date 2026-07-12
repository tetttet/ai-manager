"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  fetchWorkspaces,
  getWorkspaceStorageKey,
  updateWorkspace,
  type Workspace,
  type WorkspacePayload,
} from "@/lib/workspace-api";
import type { ApiTokenProvider } from "@/lib/api-client";

type WorkspaceContextValue = {
  accountId: string | null;
  getToken: ApiTokenProvider;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  selectWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: (preferredWorkspaceId?: string) => Promise<void>;
  updateActiveWorkspace: (payload: WorkspacePayload) => Promise<Workspace>;
};

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function persistActiveWorkspace(accountId: string, workspaceId: string) {
  window.localStorage.setItem(getWorkspaceStorageKey(accountId), workspaceId);
}

function readPersistedWorkspace(accountId: string) {
  return window.localStorage.getItem(getWorkspaceStorageKey(accountId));
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const accountId = user?.id ?? null;
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;

  const refreshWorkspaces = React.useCallback(
    async (preferredWorkspaceId?: string) => {
      if (!accountId) {
        setWorkspaces([]);
        setActiveWorkspaceId(null);
        setIsLoading(false);
        return;
      }

      const state = await fetchWorkspaces({ getToken });
      const workspaceIds = new Set(
        state.workspaces.map((workspace) => workspace.id),
      );
      const persistedWorkspaceId = readPersistedWorkspace(accountId);
      const nextActiveWorkspaceId =
        (preferredWorkspaceId && workspaceIds.has(preferredWorkspaceId)
          ? preferredWorkspaceId
          : null) ||
        (persistedWorkspaceId && workspaceIds.has(persistedWorkspaceId)
          ? persistedWorkspaceId
          : null) ||
        state.selectedWorkspaceId ||
        state.workspaces[0]?.id ||
        null;

      setWorkspaces(state.workspaces);
      setActiveWorkspaceId(nextActiveWorkspaceId);

      if (nextActiveWorkspaceId) {
        persistActiveWorkspace(accountId, nextActiveWorkspaceId);
      }

      if (state.workspaces.length === 0) {
        router.replace("/onboarding/workspace");
      }
    },
    [accountId, getToken, router],
  );

  React.useEffect(() => {
    let shouldIgnore = false;

    async function loadWorkspaces() {
      if (!isLoaded) {
        return;
      }

      if (!accountId) {
        setWorkspaces([]);
        setActiveWorkspaceId(null);
        setError("Sign in to load workspaces.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        await refreshWorkspaces();
      } catch (loadError) {
        if (!shouldIgnore) {
          setWorkspaces([]);
          setActiveWorkspaceId(null);
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspaces();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, isLoaded, refreshWorkspaces]);

  const selectWorkspace = React.useCallback(
    (workspaceId: string) => {
      if (!accountId) {
        return;
      }

      setActiveWorkspaceId(workspaceId);
      persistActiveWorkspace(accountId, workspaceId);
    },
    [accountId],
  );

  const updateActiveWorkspace = React.useCallback(
    async (payload: WorkspacePayload) => {
      if (!accountId || !activeWorkspaceId) {
        throw new Error("Workspace is required.");
      }

      const savedWorkspace = await updateWorkspace(
        activeWorkspaceId,
        payload,
        { getToken },
      );

      setWorkspaces((currentWorkspaces) =>
        currentWorkspaces.map((workspace) =>
          workspace.id === savedWorkspace.id ? savedWorkspace : workspace,
        ),
      );
      setActiveWorkspaceId(savedWorkspace.id);
      persistActiveWorkspace(accountId, savedWorkspace.id);

      return savedWorkspace;
    },
    [accountId, activeWorkspaceId, getToken],
  );

  const value = React.useMemo<WorkspaceContextValue>(
    () => ({
      accountId,
      getToken,
      workspaces,
      activeWorkspace,
      activeWorkspaceId,
      isLoading,
      error,
      selectWorkspace,
      refreshWorkspaces,
      updateActiveWorkspace,
    }),
    [
      accountId,
      getToken,
      workspaces,
      activeWorkspace,
      activeWorkspaceId,
      isLoading,
      error,
      selectWorkspace,
      refreshWorkspaces,
      updateActiveWorkspace,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
        Loading workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-sm text-muted-foreground">
        Preparing workspace...
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider.");
  }

  return context;
}
