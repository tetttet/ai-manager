"use client"

import * as React from "react"
import {
  Bot,
  Clock3,
  Database,
  MessagesSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkspace } from "@/components/dashboard/workspace-provider"
import {
  fetchWorkflowRuns,
  type AiRun,
  type MemoryTopic,
  type WorkflowConversation,
  type WorkflowRunsSnapshot,
} from "@/lib/workflow-observability-api"
import { cn } from "@/lib/utils"

const statusClassName: Record<string, string> = {
  started: "border-blue-200 bg-blue-50 text-blue-700",
  succeeded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  skipped: "border-zinc-200 bg-zinc-50 text-zinc-700",
  open: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-700",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return "No activity"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getContactLabel(conversation: WorkflowConversation) {
  return (
    conversation.contactDisplayName ||
    conversation.contactUsername ||
    [conversation.contactFirstName, conversation.contactLastName]
      .filter(Boolean)
      .join(" ") ||
    conversation.title ||
    conversation.externalConversationId
  )
}

function getRunTokenTotal(run: AiRun) {
  return run.totalTokens ?? run.totalTokensEstimate
}

function getImportantEntries(topic: MemoryTopic) {
  return Object.entries(topic.importantData).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string" && Boolean(item))
        .map((item) => [key, item] as const)
    }

    if (typeof value === "string" && value) {
      return [[key, value] as const]
    }

    return []
  })
}

function StatBox({
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

function TopicBlock({ topic }: { topic: MemoryTopic }) {
  const importantEntries = getImportantEntries(topic)

  return (
    <div className="border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 truncate text-sm font-medium">
          {topic.title}
        </div>
        <Badge
          variant="outline"
          className={cn("rounded-md", statusClassName[topic.status])}
        >
          {topic.status}
        </Badge>
      </div>
      {topic.summary ? (
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {topic.summary}
        </p>
      ) : null}
      {importantEntries.length > 0 ? (
        <div className="mt-2 grid gap-1.5 text-xs">
          {importantEntries.slice(0, 8).map(([key, value], index) => (
            <div key={`${key}-${index}`} className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">{key}</span>
              <span className="min-w-0 flex-1">{value}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{formatNumber(topic.messageCount)} messages</span>
        <span>{formatNumber(topic.tokenCountEstimate)} est. tokens</span>
        <span>{formatDate(topic.lastMessageAt)}</span>
      </div>
    </div>
  )
}

function ConversationRow({
  conversation,
}: {
  conversation: WorkflowConversation
}) {
  const contactLabel = getContactLabel(conversation)

  return (
    <div className="border-t py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold tracking-normal">
              {contactLabel}
            </h2>
            <Badge
              variant="outline"
              className={cn("rounded-md", statusClassName[conversation.status])}
            >
              {conversation.status}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{conversation.agentName}</span>
            <span>@{conversation.botUsername ?? "telegram"}</span>
            <span>{conversation.conversationType}</span>
            <span>{formatDate(conversation.lastMessageAt)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border px-2 py-1">
            <div className="font-semibold">{conversation.inboundCount}</div>
            <div className="text-muted-foreground">in</div>
          </div>
          <div className="rounded-md border px-2 py-1">
            <div className="font-semibold">{conversation.outboundCount}</div>
            <div className="text-muted-foreground">out</div>
          </div>
          <div className="rounded-md border px-2 py-1">
            <div className="font-semibold">{conversation.memoryTopics.length}</div>
            <div className="text-muted-foreground">topics</div>
          </div>
        </div>
      </div>
      {conversation.latestMessages.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {conversation.latestMessages.slice(-4).map((message) => (
            <div
              key={message.id}
              className="grid gap-1 rounded-md bg-muted/40 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{message.direction}</span>
                <span>{formatDate(message.sentAt ?? message.createdAt)}</span>
              </div>
              <p className="line-clamp-2 leading-5">
                {message.text || `[${message.messageType}]`}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {conversation.memoryTopics.length > 0 ? (
        <div className="mt-3 rounded-lg border bg-background p-3">
          {conversation.memoryTopics.slice(0, 3).map((topic) => (
            <TopicBlock key={topic.id} topic={topic} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function RunRow({ run }: { run: AiRun }) {
  return (
    <div className="border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">
              {run.runType.replace("_", " ")}
            </span>
            <Badge
              variant="outline"
              className={cn("rounded-md", statusClassName[run.status])}
            >
              {run.status}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {run.agentName ?? "Agent"} ·{" "}
            {run.contactDisplayName || run.contactUsername || "Conversation"}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{formatNumber(getRunTokenTotal(run))} tokens</div>
          <div>{formatDate(run.completedAt ?? run.createdAt)}</div>
        </div>
      </div>
      {run.error ? (
        <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {run.error}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{run.model ?? run.provider}</span>
        <span>{run.knowledgeSourceCount} sources</span>
        <span>{run.memoryTopicTitle ?? "No topic"}</span>
      </div>
    </div>
  )
}

export default function RunsPage() {
  const { getToken, activeWorkspaceId } = useWorkspace()
  const [snapshot, setSnapshot] = React.useState<WorkflowRunsSnapshot | null>(
    null,
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadRuns = React.useCallback(async () => {
    if (!activeWorkspaceId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSnapshot(
        await fetchWorkflowRuns({
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

    async function loadInitialRuns() {
      if (!activeWorkspaceId) {
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const nextSnapshot = await fetchWorkflowRuns({
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

    void loadInitialRuns()

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
            className="h-24 animate-pulse rounded-lg border bg-muted/30"
          />
        ))}
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-normal">
            Workflow runs
          </h1>
          <p className="text-sm text-muted-foreground">
            Telegram sessions, memory topics, messages, and AI spend.
          </p>
        </div>
        <Button variant="outline" onClick={loadRuns} disabled={isLoading}>
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatBox
              icon={MessagesSquare}
              label="Conversations"
              value={formatNumber(snapshot.stats.conversations)}
            />
            <StatBox
              icon={Clock3}
              label="Open"
              value={formatNumber(snapshot.stats.openConversations)}
            />
            <StatBox
              icon={Bot}
              label="Messages"
              value={formatNumber(snapshot.stats.messages)}
            />
            <StatBox
              icon={Database}
              label="Topics"
              value={formatNumber(snapshot.stats.memoryTopics)}
            />
            <StatBox
              icon={Sparkles}
              label="Tokens"
              value={formatNumber(snapshot.stats.tokens)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-normal">
                  Telegram sessions
                </h2>
                <Badge variant="outline">
                  {snapshot.conversations.length} shown
                </Badge>
              </div>
              {snapshot.conversations.length > 0 ? (
                snapshot.conversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No Telegram conversations yet.
                </div>
              )}
            </section>

            <section className="rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-normal">
                  Recent AI runs
                </h2>
                <Badge variant="outline">{snapshot.recentRuns.length}</Badge>
              </div>
              {snapshot.recentRuns.length > 0 ? (
                snapshot.recentRuns.map((run) => (
                  <RunRow key={run.id} run={run} />
                ))
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No AI runs yet.
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}
