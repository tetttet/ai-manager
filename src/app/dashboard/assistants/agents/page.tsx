"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Blocks,
  Grid2X2,
  List,
  Loader2,
  Plus,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { UserAvatar } from "@/components/ui/user-avatar";
import AgentCard from "@/components/cards/agent-card";
import { AgentKnowledgeCanvas } from "@/components/dashboard/agent-knowledge-canvas";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import {
  agentsUpdatedEventName,
  createRemoteAgentRepository,
  type Agent,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/agent-repository";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortMode = "asc" | "desc";

type AgentCardItem = Agent & {
  deployedAt: string;
};

interface Activity {
  id: string;
  username: string;
  time: string;
  text: string;
  agentName: string;
}

const emptyAgentForm: CreateAgentInput = {
  name: "",
  description: "",
};

const emptyEditAgentForm: UpdateAgentInput = {
  name: "",
  description: "",
};

function notifyAgentsUpdated() {
  window.dispatchEvent(new Event(agentsUpdatedEventName));
}

const smoothLayoutTransition: Transition = {
  layout: {
    type: "spring",
    stiffness: 285,
    damping: 34,
    mass: 0.82,
  },
  opacity: {
    duration: 0.18,
    ease: "easeOut",
  },
  filter: {
    duration: 0.18,
    ease: "easeOut",
  },
};

const reducedMotionTransition: Transition = {
  duration: 0,
};

const agentItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.985,
    filter: "blur(3px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: Math.min(index * 0.035, 0.14),
      duration: 0.26,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.985,
    filter: "blur(3px)",
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
};

const viewOptions: {
  label: string;
  value: ViewMode;
  icon: typeof Grid2X2;
}[] = [
  { label: "Grid view", value: "grid", icon: Grid2X2 },
  { label: "List view", value: "list", icon: List },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function getRelativeTimeLabel(dateValue: string) {
  const timestamp = Date.parse(dateValue);

  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const diffInMs = Math.max(0, Date.now() - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffInMs < minute) {
    return "just now";
  }

  if (diffInMs < hour) {
    const minutes = Math.floor(diffInMs / minute);

    return `${minutes} min ago`;
  }

  if (diffInMs < day) {
    const hours = Math.floor(diffInMs / hour);

    return `${hours} hr ago`;
  }

  const days = Math.floor(diffInMs / day);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function sortAgentsByCreatedAt(firstAgent: Agent, secondAgent: Agent) {
  return (
    Date.parse(secondAgent.createdAt) - Date.parse(firstAgent.createdAt)
  );
}

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [hasHydratedAgents, setHasHydratedAgents] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("asc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [agentForm, setAgentForm] =
    useState<CreateAgentInput>(emptyAgentForm);
  const [formError, setFormError] = useState("");
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [editAgent, setEditAgent] = useState<AgentCardItem | null>(null);
  const [editAgentForm, setEditAgentForm] =
    useState<UpdateAgentInput>(emptyEditAgentForm);
  const [editFormError, setEditFormError] = useState("");
  const [isEditConfirming, setIsEditConfirming] = useState(false);
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false);
  const [deleteAgent, setDeleteAgent] = useState<AgentCardItem | null>(null);
  const [deleteFormError, setDeleteFormError] = useState("");
  const [isDeletingAgent, setIsDeletingAgent] = useState(false);
  const [connectionAgent, setConnectionAgent] = useState<AgentCardItem | null>(
    null,
  );
  const { user, isLoaded } = useUser();
  const { accountId, getToken, activeWorkspace, activeWorkspaceId } =
    useWorkspace();
  const shouldReduceMotion = useReducedMotion();
  const layoutTransition = shouldReduceMotion
    ? reducedMotionTransition
    : smoothLayoutTransition;
  const hasAgents = agents.length > 0;
  const canCreateAgent =
    agentForm.name.trim().length > 0 &&
    Boolean(accountId) &&
    Boolean(activeWorkspaceId) &&
    !isCreatingAgent;
  const canUpdateAgent =
    editAgentForm.name.trim().length > 0 &&
    Boolean(accountId) &&
    Boolean(activeWorkspaceId) &&
    !isUpdatingAgent;
  const userInitial = user?.firstName?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    let shouldIgnore = false;

    async function loadAgents() {
      if (!isLoaded) {
        return;
      }

      if (!accountId || !activeWorkspaceId) {
        setAgents([]);
        setPageError("Choose a workspace to load and save bots.");
        setHasHydratedAgents(true);
        return;
      }

      try {
        setHasHydratedAgents(false);
        setPageError(null);
        const storedAgents = await createRemoteAgentRepository({
          getToken,
          workspaceId: activeWorkspaceId,
        }).listAgents();

        if (!shouldIgnore) {
          setAgents(storedAgents);
        }
      } catch (error) {
        if (!shouldIgnore) {
          setAgents([]);
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (!shouldIgnore) {
          setHasHydratedAgents(true);
        }
      }
    }

    void loadAgents();

    return () => {
      shouldIgnore = true;
    };
  }, [accountId, activeWorkspaceId, getToken, isLoaded]);

  const filteredAgents = useMemo<AgentCardItem[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = agents.filter((agent) => {
      return (
        agent.name.toLowerCase().includes(normalizedSearch) ||
        agent.description.toLowerCase().includes(normalizedSearch)
      );
    });

    return [...filtered].sort((firstAgent, secondAgent) => {
      const comparison = firstAgent.name.localeCompare(secondAgent.name);

      return sortMode === "asc" ? comparison : -comparison;
    }).map((agent) => ({
      ...agent,
      deployedAt: getRelativeTimeLabel(agent.createdAt),
    }));
  }, [agents, search, sortMode]);

  const activities = useMemo<Activity[]>(() => {
    return [...agents]
      .sort(sortAgentsByCreatedAt)
      .slice(0, 5)
      .map((agent) => ({
        id: agent.id,
        username: userInitial,
        time: getRelativeTimeLabel(agent.createdAt),
        text: "created the bot",
        agentName: agent.name,
      }));
  }, [agents, userInitial]);

  const toggleSort = () => {
    setSortMode((currentMode) => (currentMode === "asc" ? "desc" : "asc"));
  };

  const openCreateDialog = () => {
    if (!accountId || !activeWorkspaceId) {
      setPageError("Choose a workspace to create a bot.");
      return;
    }

    setAgentForm(emptyAgentForm);
    setFormError("");
    setPageError(null);
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormError("");
  };

  const openEditDialog = (agent: { id: string }) => {
    const selectedAgent = filteredAgents.find(
      (filteredAgent) => filteredAgent.id === agent.id,
    );

    if (!selectedAgent) {
      return;
    }

    setEditAgent(selectedAgent);
    setEditAgentForm({
      name: selectedAgent.name,
      description: selectedAgent.description,
    });
    setEditFormError("");
    setIsEditConfirming(false);
  };

  const closeEditDialog = () => {
    setEditAgent(null);
    setEditAgentForm(emptyEditAgentForm);
    setEditFormError("");
    setIsEditConfirming(false);
  };

  const openAgentConnections = (agent: { id: string }) => {
    if (!accountId || !activeWorkspaceId) {
      setPageError("Choose a workspace to configure bot connections.");
      return;
    }

    const selectedAgent = filteredAgents.find(
      (filteredAgent) => filteredAgent.id === agent.id,
    );

    if (selectedAgent) {
      setConnectionAgent(selectedAgent);
    }
  };

  const closeAgentConnections = () => {
    setConnectionAgent(null);
  };

  const handleCreateAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accountId || !activeWorkspaceId) {
      setFormError("Choose a workspace to create a bot.");

      return;
    }

    if (!agentForm.name.trim()) {
      setFormError("Enter a bot name.");

      return;
    }

    setIsCreatingAgent(true);
    setFormError("");

    try {
      const createdAgent = await createRemoteAgentRepository({
        getToken,
        workspaceId: activeWorkspaceId,
      }).createAgent(agentForm);

      setAgents((currentAgents) => [createdAgent, ...currentAgents]);
      setSearch("");
      setPageError(null);
      notifyAgentsUpdated();
      closeCreateDialog();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleEditAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editAgent) {
      return;
    }

    if (!accountId || !activeWorkspaceId) {
      setEditFormError("Choose a workspace to update this bot.");
      setIsEditConfirming(false);

      return;
    }

    if (!editAgentForm.name.trim()) {
      setEditFormError("Enter a bot name.");
      setIsEditConfirming(false);

      return;
    }

    if (!isEditConfirming) {
      setEditFormError("");
      setIsEditConfirming(true);

      return;
    }

    setIsUpdatingAgent(true);
    setEditFormError("");

    try {
      const updatedAgent = await createRemoteAgentRepository({
        getToken,
        workspaceId: activeWorkspaceId,
      }).updateAgent(
        editAgent.id,
        editAgentForm,
      );

      setAgents((currentAgents) =>
        currentAgents.map((currentAgent) =>
          currentAgent.id === updatedAgent.id ? updatedAgent : currentAgent,
        ),
      );
      setConnectionAgent((currentAgent) =>
        currentAgent?.id === updatedAgent.id
          ? {
              ...updatedAgent,
              deployedAt: getRelativeTimeLabel(updatedAgent.createdAt),
            }
          : currentAgent,
      );
      setPageError(null);
      notifyAgentsUpdated();
      closeEditDialog();
    } catch (error) {
      setEditFormError(getErrorMessage(error));
      setIsEditConfirming(false);
    } finally {
      setIsUpdatingAgent(false);
    }
  };

  const openDeleteDialog = (agent: { id: string }) => {
    const selectedAgent = filteredAgents.find(
      (filteredAgent) => filteredAgent.id === agent.id,
    );

    if (!selectedAgent) {
      return;
    }

    setDeleteAgent(selectedAgent);
    setDeleteFormError("");
  };

  const closeDeleteDialog = () => {
    if (isDeletingAgent) {
      return;
    }

    setDeleteAgent(null);
    setDeleteFormError("");
  };

  const confirmDeleteAgent = async () => {
    if (!deleteAgent) {
      return;
    }

    if (!accountId || !activeWorkspaceId) {
      setDeleteFormError("Choose a workspace to delete this bot.");
      return;
    }

    setIsDeletingAgent(true);
    setDeleteFormError("");

    try {
      await createRemoteAgentRepository({
        getToken,
        workspaceId: activeWorkspaceId,
      }).deleteAgent(deleteAgent.id);
      setAgents((currentAgents) =>
        currentAgents.filter((currentAgent) => currentAgent.id !== deleteAgent.id),
      );
      setConnectionAgent((currentAgent) =>
        currentAgent?.id === deleteAgent.id ? null : currentAgent,
      );
      setPageError(null);
      notifyAgentsUpdated();
      setDeleteAgent(null);
    } catch (error) {
      setDeleteFormError(getErrorMessage(error));
    } finally {
      setIsDeletingAgent(false);
    }
  };

  const emptyStateTitle = hasAgents ? "No agents found" : "No bots yet";
  const emptyStateDescription = hasAgents
    ? "Try changing your search request or create a new agent."
    : "Create your first bot and it will stay synced to your account database.";

  useEffect(() => {
    if (!connectionAgent) {
      return;
    }

    document.querySelector<HTMLElement>("[data-dashboard-scroll]")?.scrollTo({
      top: 0,
      left: 0,
    });
  }, [connectionAgent]);

  if (connectionAgent && accountId && activeWorkspaceId) {
    return (
      <div className="relative h-[calc(100svh-7rem)] min-h-[620px] text-zinc-950">
        <AgentKnowledgeCanvas
          key={connectionAgent.id}
          agent={connectionAgent}
          accountId={accountId}
          getToken={getToken}
          workspaceId={activeWorkspaceId}
          onClose={closeAgentConnections}
        />
      </div>
    );
  }

  return (
    <div className="text-zinc-950">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-b from-pink-300 via-violet-300 to-indigo-400">
            <Blocks className="size-8 text-white" strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-[20px] font-bold tracking-tight sm:text-[20px]">
              {activeWorkspace?.name ?? "Workspace"}
            </h1>

            <Badge
              variant="secondary"
              className="mt-1 rounded-md bg-zinc-200 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-200"
            >
              {activeWorkspace?.businessType === "company" ? "Company" : "Personal"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isLoaded ? (
            <UserAvatar
              name={user?.firstName || "User"}
              initials={user?.firstName ? user.firstName[0] : "U"}
              imageUrl={user?.imageUrl || undefined}
            />
          ) : (
            <Skeleton className="size-8 rounded-full" />
          )}

          <Button
            type="button"
            onClick={openCreateDialog}
            disabled={!hasHydratedAgents || !accountId || !activeWorkspaceId}
            className="h-10 rounded-sm px-5 text-[14px] font-semibold"
          >
            <Plus className="size-4" />
            Create Bot
          </Button>
        </div>
      </header>

      {/* Main content */}
      <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <section className="mb-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-5 size-4 -translate-y-1/2 text-zinc-400" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search agents"
                className="h-10 rounded-sm border-zinc-200 bg-white pl-10 text-base placeholder:text-zinc-400 focus-visible:ring-2"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleSort}
                className="size-10 rounded-sm bg-white"
                aria-label="Change sorting"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={sortMode}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, rotate: sortMode === "asc" ? -35 : 35 }
                    }
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, rotate: sortMode === "asc" ? 35 : -35 }
                    }
                    transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
                    className="flex"
                  >
                    {sortMode === "asc" ? (
                      <ArrowDownAZ className="size-5" />
                    ) : (
                      <ArrowUpAZ className="size-5" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>

              <div className="flex h-10 items-center rounded-sm border border-zinc-200 bg-white p-1">
                {viewOptions.map(({ label, value, icon: Icon }) => {
                  const isActive = viewMode === value;

                  return (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewMode(value)}
                      className={cn(
                        "relative size-9 overflow-hidden rounded-[3px] transition-colors",
                        isActive ? "text-zinc-950" : "text-zinc-500",
                      )}
                      aria-label={label}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="agents-view-mode-indicator"
                          className="absolute inset-0 rounded-[3px] bg-zinc-100"
                          transition={layoutTransition}
                        />
                      )}

                      <Icon className="relative z-10 size-5" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </section>

          {pageError ? (
            <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-medium text-red-700">
              {pageError}
            </div>
          ) : null}

          <LayoutGroup id="agents-layout">
            <AnimatePresence mode="wait" initial={false}>
              {!hasHydratedAgents ? (
                <motion.div
                  key="loading"
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4",
                  )}
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card
                      key={index}
                      className="rounded-sm border-zinc-200 bg-white p-5 shadow-none"
                    >
                      <div className="flex items-start gap-3.5">
                        <Skeleton className="size-11 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="mt-6 grid gap-3 xl:grid-cols-2">
                        <Skeleton className="h-16 rounded-sm" />
                        <Skeleton className="h-16 rounded-sm" />
                      </div>
                    </Card>
                  ))}
                </motion.div>
              ) : filteredAgents.length > 0 ? (
                <motion.div
                  key="agents"
                  layout
                  transition={layoutTransition}
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4",
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredAgents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        layout
                        custom={index}
                        variants={agentItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={layoutTransition}
                        className={cn(
                          "min-w-0",
                          viewMode === "list" && "w-full",
                        )}
                      >
                        <AgentCard
                          agent={agent}
                          viewMode={viewMode}
                          onConnect={openAgentConnections}
                          onEdit={openEditDialog}
                          onDelete={openDeleteDialog}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 12, filter: "blur(3px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                >
                  <Card className="border-dashed bg-white shadow-none rounded-sm border-zinc-200">
                    <CardContent className="flex min-h-85 flex-col items-center justify-center p-8 text-center">
                      <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100">
                        <Search className="size-6 text-zinc-400" />
                      </div>

                      <h2 className="mt-5 text-xl font-semibold">
                        {emptyStateTitle}
                      </h2>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                        {emptyStateDescription}
                      </p>

                      <Button
                        type="button"
                        onClick={openCreateDialog}
                        disabled={!accountId || !activeWorkspaceId}
                        className="mt-5 rounded-sm"
                      >
                        <Plus className="size-4" />
                        Create Bot
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        <RecentActivity
          activities={activities}
          isLoading={!hasHydratedAgents}
        />
      </section>

      {isCreateDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6"
          onMouseDown={closeCreateDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-agent-dialog-title"
            className="w-full max-w-sm rounded-sm border border-zinc-200 bg-white p-4 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="create-agent-dialog-title"
                className="text-sm font-semibold tracking-normal"
              >
                Create bot
              </h2>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close dialog"
                className="text-zinc-500"
                onClick={closeCreateDialog}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateAgent}>
              <div className="space-y-1.5">
                <label
                  htmlFor="agent-name"
                  className="text-xs font-medium text-zinc-500"
                >
                  Bot name
                </label>

                <Input
                  id="agent-name"
                  autoFocus
                  value={agentForm.name}
                  placeholder="Support bot"
                  onChange={(event) =>
                    setAgentForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="agent-description"
                  className="text-xs font-medium text-zinc-500"
                >
                  Description
                </label>

                <textarea
                  id="agent-description"
                  value={agentForm.description}
                  placeholder="What should this bot help with?"
                  rows={4}
                  onChange={(event) =>
                    setAgentForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-24 w-full resize-none rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              {formError ? (
                <p className="text-xs font-medium text-red-600">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeCreateDialog}
                  className="rounded-sm"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!canCreateAgent}
                  className="rounded-sm"
                >
                  {isCreatingAgent ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {isCreatingAgent ? "Creating..." : "Create Bot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editAgent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6"
          onMouseDown={closeEditDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-agent-dialog-title"
            className="w-full max-w-sm rounded-sm border border-zinc-200 bg-white p-4 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="edit-agent-dialog-title"
                  className="text-sm font-semibold tracking-normal"
                >
                  Edit bot
                </h2>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {editAgent.name}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close edit dialog"
                className="text-zinc-500"
                onClick={closeEditDialog}
                disabled={isUpdatingAgent}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleEditAgent}>
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-agent-name"
                  className="text-xs font-medium text-zinc-500"
                >
                  Bot name
                </label>

                <Input
                  id="edit-agent-name"
                  autoFocus
                  value={editAgentForm.name}
                  placeholder="Support bot"
                  onChange={(event) => {
                    setEditAgentForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }));
                    setIsEditConfirming(false);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-agent-description"
                  className="text-xs font-medium text-zinc-500"
                >
                  Description
                </label>

                <textarea
                  id="edit-agent-description"
                  value={editAgentForm.description}
                  placeholder="What should this bot help with?"
                  rows={4}
                  onChange={(event) => {
                    setEditAgentForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }));
                    setIsEditConfirming(false);
                  }}
                  className="min-h-24 w-full resize-none rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              {isEditConfirming ? (
                <div className="rounded-sm border border-amber-200 bg-amber-50 p-3">
                  <div className="flex gap-2">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-900">
                        Are you sure you want to update this bot?
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        The new name and description will replace the current
                        card details in the database.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {editFormError ? (
                <p className="text-xs font-medium text-red-600">
                  {editFormError}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={
                    isEditConfirming
                      ? () => setIsEditConfirming(false)
                      : closeEditDialog
                  }
                  disabled={isUpdatingAgent}
                  className="rounded-sm"
                >
                  {isEditConfirming ? "Back" : "Cancel"}
                </Button>

                <Button
                  type="submit"
                  disabled={!canUpdateAgent}
                  className="rounded-sm"
                >
                  {isUpdatingAgent ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {isUpdatingAgent
                    ? "Updating..."
                    : isEditConfirming
                      ? "Update bot"
                      : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteAgent ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6"
          onMouseDown={closeDeleteDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-agent-dialog-title"
            className="w-full max-w-sm rounded-sm border border-zinc-200 bg-white p-4 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="delete-agent-dialog-title"
                  className="text-sm font-semibold tracking-normal"
                >
                  Delete bot?
                </h2>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {deleteAgent.name}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close delete dialog"
                className="text-zinc-500"
                onClick={closeDeleteDialog}
                disabled={isDeletingAgent}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-sm border border-red-200 bg-red-50 p-3">
              <div className="flex gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-900">
                    This will permanently delete this bot.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-800">
                    Its database record and saved connection setup will be
                    removed.
                  </p>
                </div>
              </div>
            </div>

            {deleteFormError ? (
              <p className="mt-3 text-xs font-medium text-red-600">
                {deleteFormError}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={closeDeleteDialog}
                disabled={isDeletingAgent}
                className="rounded-sm"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteAgent}
                disabled={isDeletingAgent}
                className="rounded-sm"
              >
                {isDeletingAgent ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {isDeletingAgent ? "Deleting..." : "Delete bot"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
};

const RecentActivity = ({
  activities,
  isLoading,
}: {
  activities: Activity[];
  isLoading: boolean;
}) => {
  return (
    <Card className="h-fit rounded-sm border-zinc-200 bg-white xl:sticky xl:top-6 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
        <h2 className="text-[15px] font-bold tracking-tight">Recent Activity</h2>

        <Button variant="outline" className="rounded-sm font-semibold text-[13px]">
          View All
        </Button>
      </CardHeader>

      <CardContent className="-mt-8 space-y-0 px-5 pb-5 sm:px-6 sm:pb-6">
        {isLoading ? (
          <div className="space-y-4 pt-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-2">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={activity.id}>
              <div className="flex gap-2 py-5">
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-700">
                    {activity.username}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-[12px] text-zinc-500">{activity.time}</p>

                  <p className="text-[12px] text-zinc-700">
                    {activity.text}{" "}
                    <span className="font-bold text-zinc-950">
                      {activity.agentName}
                    </span>
                  </p>
                </div>
              </div>

              {index !== activities.length - 1 && <Separator />}
            </div>
          ))
        ) : (
          <p className="pt-5 text-[12px] leading-5 text-zinc-500">
            No activity yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentsPage;
