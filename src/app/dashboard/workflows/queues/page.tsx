"use client"

import * as React from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  RefreshCw,
  SkipForward,
  Timer,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/components/dashboard/workspace-provider"
import {
  fetchWorkflowQueues,
  type AiRun,
  type WorkflowQueuesSnapshot,
} from "@/lib/workflow-observability-api"
import { cn } from "@/lib/utils"

const statusClassName: Record<string, string> = {
  started: "border-blue-200 bg-blue-50 text-blue-700",
  succeeded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  skipped: "border-zinc-200 bg-zinc-50 text-zinc-700",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return "Pending"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getRunTokenTotal(run: AiRun) {
  return run.totalTokens ?? run.totalTokensEstimate
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-normal">{value}</div>
    </div>
  )
}

function RunRow({ run }: { run: AiRun }) {
  return (
    <div className="grid gap-2 border-t py-3 text-sm first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[160px_minmax(0,1fr)_120px_120px] md:items-center">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("rounded-md", statusClassName[run.status])}
        >
          {run.status}
        </Badge>
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">
          {run.runType.replace("_", " ")} · {run.agentName ?? "Agent"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {run.contactDisplayName ||
            run.contactUsername ||
            run.conversationTitle ||
            "Conversation"}{" "}
          · {run.model ?? run.provider}
        </div>
        {run.error ? (
          <div className="mt-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
            {run.error}
          </div>
        ) : null}
      </div>
      <div className="text-xs text-muted-foreground md:text-right">
        {formatNumber(getRunTokenTotal(run))} tokens
      </div>
      <div className="text-xs text-muted-foreground md:text-right">
        {formatDate(run.completedAt ?? run.createdAt)}
      </div>
    </div>
  )
}

export default function QueuesPage() {
  const { getToken, activeWorkspaceId } = useWorkspace()
  const [snapshot, setSnapshot] =
    React.useState<WorkflowQueuesSnapshot | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadQueues = React.useCallback(async () => {
    if (!activeWorkspaceId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSnapshot(
        await fetchWorkflowQueues({
          getToken,
          workspaceId: activeWorkspaceId,
        }),
      )
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Load failed.")
    } finally {
      setIsLoading(false)
    }
  }, [activeWorkspaceId, getToken])

  React.useEffect(() => {
    let shouldIgnore = false

    async function loadInitialQueues() {
      if (!activeWorkspaceId) {
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const nextSnapshot = await fetchWorkflowQueues({
          getToken,
          workspaceId: activeWorkspaceId,
        })

        if (!shouldIgnore) {
          setSnapshot(nextSnapshot)
        }
      } catch (loadError) {
        if (!shouldIgnore) {
          setError(
            loadError instanceof Error ? loadError.message : "Load failed.",
          )
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialQueues()

    return () => {
      shouldIgnore = true
    }
  }, [activeWorkspaceId, getToken])

  if (isLoading && !snapshot) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-lg border bg-muted/30"
          />
        ))}
      </div>
    )
  }

  const queueCounts = snapshot?.queue.counts ?? {}

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">
            Workflow queues
          </h1>
          <p className="text-sm text-muted-foreground">
            BullMQ queue state, worker throughput, and token spend.
          </p>
        </div>
        <Button variant="outline" onClick={loadQueues} disabled={isLoading}>
          <RefreshCw className={cn(isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {snapshot ? (
        <>
          <section className="rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold tracking-normal">
                  {snapshot.queue.name}
                </h2>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    {snapshot.queue.available ? "Redis connected" : "Redis unavailable"}
                  </span>
                  <span>
                    {snapshot.queue.isPaused ? "paused" : "running"}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md",
                  snapshot.queue.available
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700",
                )}
              >
                {snapshot.queue.available ? "available" : "offline"}
              </Badge>
            </div>
            {snapshot.queue.error ? (
              <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {snapshot.queue.error}
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <MetricBox
                icon={Clock3}
                label="Waiting"
                value={formatNumber(queueCounts.waiting ?? 0)}
              />
              <MetricBox
                icon={Activity}
                label="Active"
                value={formatNumber(queueCounts.active ?? 0)}
              />
              <MetricBox
                icon={Timer}
                label="Delayed"
                value={formatNumber(queueCounts.delayed ?? 0)}
              />
              <MetricBox
                icon={CheckCircle2}
                label="Completed"
                value={formatNumber(queueCounts.completed ?? 0)}
              />
              <MetricBox
                icon={AlertTriangle}
                label="Failed"
                value={formatNumber(queueCounts.failed ?? 0)}
              />
              <MetricBox
                icon={PauseCircle}
                label="Paused"
                value={formatNumber(queueCounts.paused ?? 0)}
              />
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricBox
              icon={Activity}
              label="Started 24h"
              value={formatNumber(snapshot.runStats.started)}
            />
            <MetricBox
              icon={CheckCircle2}
              label="Succeeded 24h"
              value={formatNumber(snapshot.runStats.succeeded)}
            />
            <MetricBox
              icon={AlertTriangle}
              label="Failed 24h"
              value={formatNumber(snapshot.runStats.failed)}
            />
            <MetricBox
              icon={SkipForward}
              label="Skipped 24h"
              value={formatNumber(snapshot.runStats.skipped)}
            />
            <MetricBox
              icon={Timer}
              label="Tokens 24h"
              value={formatNumber(snapshot.runStats.tokens)}
            />
          </div>

          <section className="rounded-lg border bg-background p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold tracking-normal">
                Recent queue-backed AI runs
              </h2>
              <Badge variant="outline">{snapshot.recentRuns.length}</Badge>
            </div>
            {snapshot.recentRuns.length > 0 ? (
              snapshot.recentRuns.map((run) => <RunRow key={run.id} run={run} />)
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No AI runs yet.
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  )
}
