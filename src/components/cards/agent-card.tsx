"use client";

import { motion, type Transition, useReducedMotion } from "framer-motion";
import {
  Bot,
  Edit3,
  MessageSquare,
  MoreVertical,
  Share2,
  TriangleAlert,
  Unplug,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface Agent {
  id: string;
  name: string;
  description: string;
  deployedAt: string;
  messages: number;
  errors: number;
  messageProgress: number;
  errorProgress: number;
  status?: "active" | "inactive";
}

interface AgentCardProps {
  agent: Agent;
  viewMode: ViewMode;
  onEdit?: (agent: Agent) => void;
  onShare?: (agent: Agent) => void;
  onDisconnect?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
}

interface AgentMetricProps {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  progress: number;
  variant?: "default" | "danger";
}

const cardLayoutTransition: Transition = {
  layout: {
    type: "spring",
    stiffness: 300,
    damping: 35,
    mass: 0.8,
  },
  default: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1],
  },
};

const reducedMotionTransition: Transition = {
  duration: 0,
};

const AgentMetric = ({
  icon: Icon,
  label,
  value,
  description,
  progress,
  variant = "default",
}: AgentMetricProps) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const isDanger = variant === "danger";

  return (
    <motion.div layout className="">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center",
              isDanger
                ? "border-red-100 text-red-600"
                : "border-zinc-200 text-zinc-700",
            )}
          >
            <Icon className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500">{label}</p>
            <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-950">
              {value.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Progress
          value={safeProgress}
          className={cn("h-1.5 bg-zinc-200", isDanger && "[&>div]:bg-red-500")}
        />

        <p className="mt-2 text-xs text-zinc-500">{description}</p>
      </div>
    </motion.div>
  );
};

const AgentCard = ({
  agent,
  viewMode,
  onEdit,
  onShare,
  onDisconnect,
  onDelete,
}: AgentCardProps) => {
  const isListView = viewMode === "list";
  const isActive = agent.status !== "inactive";
  const shouldReduceMotion = useReducedMotion();
  const layoutTransition = shouldReduceMotion
    ? reducedMotionTransition
    : cardLayoutTransition;

  return (
    <motion.div
      layout
      data-slot="card"
      transition={layoutTransition}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm",
        "group overflow-hidden border-zinc-200 bg-white py-0 shadow-none",
        "transition-[border-color,box-shadow] duration-200 ease-out",
        "hover:border-zinc-300 hover:shadow-xs",
        isListView ? "w-full rounded-sm" : "w-full pb-2 rounded-sm",
      )}
    >
      <CardHeader className={cn("p-5", isListView && "lg:px-6 lg:py-5")}>
        <motion.div
          layout
          transition={layoutTransition}
          className={cn(
            "flex gap-4",
            isListView
              ? "flex-col sm:flex-row sm:items-center sm:justify-between"
              : "items-start justify-between",
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="flex size-11 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                <Bot className="size-6" strokeWidth={1.8} />
              </div>

              <span
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white",
                  isActive ? "bg-emerald-500" : "bg-zinc-400",
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[15px] font-semibold tracking-tight text-zinc-950">
                  {agent.name}
                </h2>
              </div>

              <p className={cn("mt-1 text-[12px] text-zinc-500")}>
                {agent.description}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                <span>Deployed {agent.deployedAt}</span>
              </div>
            </div>
          </div>

          <motion.div
            layout
            transition={layoutTransition}
            className={cn(
              "flex shrink-0 items-center",
              isListView && "self-end sm:self-auto",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDisconnect?.(agent)}
              className="size-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Disconnect agent"
            >
              <Unplug className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(agent)}
              className="size-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Edit agent"
            >
              <Edit3 className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900"
                  aria-label="Open agent menu"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-48 rounded-xl p-1.5"
              >
                <DropdownMenuItem
                  onClick={() => onEdit?.(agent)}
                  className="cursor-pointer rounded-lg"
                >
                  <Edit3 className="mr-2 size-4" />
                  Edit agent
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onShare?.(agent)}
                  className="cursor-pointer rounded-lg"
                >
                  <Share2 className="mr-2 size-4" />
                  Share agent
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onDisconnect?.(agent)}
                  className="cursor-pointer rounded-lg"
                >
                  <Unplug className="mr-2 size-4" />
                  Disconnect
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onDelete?.(agent)}
                  className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </motion.div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <motion.div
          layout
          transition={layoutTransition}
          className={cn(
            "mt-0 grid gap-3",
            isListView ? "sm:grid-cols-2" : "grid-cols-1 xl:grid-cols-2",
          )}
        >
          <AgentMetric
            icon={MessageSquare}
            label="Messages"
            value={agent.messages}
            description={
              agent.messages === 0 ? "No activity yet" : "Total conversations"
            }
            progress={agent.messageProgress}
          />

          <AgentMetric
            icon={TriangleAlert}
            label="Errors"
            value={agent.errors}
            description={
              agent.errors === 0
                ? "Everything is running normally"
                : "Requires your attention"
            }
            progress={agent.errorProgress}
            variant="danger"
          />
        </motion.div>
      </CardContent>
    </motion.div>
  );
};

export default AgentCard;
