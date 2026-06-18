"use client";

import { useMemo, useState } from "react";
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
  Plus,
  Search,
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
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortMode = "asc" | "desc";

interface Agent {
  id: string;
  name: string;
  description: string;
  deployedAt: string;
  messages: number;
  errors: number;
  messageProgress: number;
  errorProgress: number;
}

interface Activity {
  id: number;
  username: string;
  time: string;
  text: string;
  agentName: string;
}

const agents: Agent[] = [
  {
    id: "1",
    name: "New Agent",
    description: "Customer support assistant",
    deployedAt: "6 days ago",
    messages: 0,
    errors: 0,
    messageProgress: 0,
    errorProgress: 0,
  },
  {
    id: "2",
    name: "Support Bot",
    description: "Customer support assistant",
    deployedAt: "6 days ago",
    messages: 0,
    errors: 0,
    messageProgress: 0,
    errorProgress: 0,
  },
  {
    id: "3",
    name: "Sales Assistant",
    description: "Customer support assistant",
    deployedAt: "6 days ago",
    messages: 0,
    errors: 0,
    messageProgress: 0,
    errorProgress: 0,
  },
];

const activities: Activity[] = [
  {
    id: 1,
    username: "T",
    time: "6 days ago",
    text: "updated the bot information of",
    agentName: "New Agent",
  },
  {
    id: 2,
    username: "T",
    time: "6 days ago",
    text: "updated the bot information of",
    agentName: "New Agent",
  },
  {
    id: 3,
    username: "T",
    time: "6 days ago",
    text: "updated the bot information of",
    agentName: "New Agent",
  },
];

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

const AgentsPage = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("asc");
  const { user, isLoaded } = useUser();
  const shouldReduceMotion = useReducedMotion();
  const layoutTransition = shouldReduceMotion
    ? reducedMotionTransition
    : smoothLayoutTransition;

  const filteredAgents = useMemo(() => {
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
    });
  }, [search, sortMode]);

  const toggleSort = () => {
    setSortMode((currentMode) => (currentMode === "asc" ? "desc" : "asc"));
  };

  return (
    <main className="text-zinc-950">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-b from-pink-300 via-violet-300 to-indigo-400">
            <Blocks className="size-8 text-white" strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-[20px] font-bold tracking-tight sm:text-[20px]">
              Default Workspace
            </h1>

            <Badge
              variant="secondary"
              className="mt-1 rounded-md bg-zinc-200 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-200"
            >
              Free
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

          <Button className="h-10 rounded-sm px-5 text-[14px] font-semibold">
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

          <LayoutGroup id="agents-layout">
            <AnimatePresence mode="wait" initial={false}>
              {filteredAgents.length > 0 ? (
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
                        <AgentCard agent={agent} viewMode={viewMode} />
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
                        No agents found
                      </h2>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                        Try changing your search request or create a new agent.
                      </p>

                      <Button className="mt- rounded-sm">
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

        <RecentActivity />
      </section>
    </main>
  );
};

const RecentActivity = () => {
  return (
    <Card className="h-fit rounded-sm border-zinc-200 bg-white xl:sticky xl:top-6 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
        <h2 className="text-[15px] font-bold tracking-tight">Recent Activity</h2>

        <Button variant="outline" className="rounded-sm font-semibold text-[13px]">
          View All
        </Button>
      </CardHeader>

      <CardContent className="-mt-8 space-y-0 px-5 pb-5 sm:px-6 sm:pb-6">
        {activities.map((activity, index) => (
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
        ))}
      </CardContent>
    </Card>
  );
};

export default AgentsPage;
