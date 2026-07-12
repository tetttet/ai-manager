"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  Layers3,
  Settings2,
  Table2,
  type LucideIcon,
} from "lucide-react";

import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { WorkspaceLogo } from "@/components/dashboard/workspace-logo";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/workspace-api";

type DashboardAction = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  icon: LucideIcon;
  cta: string;
  checkpoints: string[];
  accentGradient: string;
  iconClassName: string;
  badgeClassName: string;
};

const actions: DashboardAction[] = [
  {
    title: "Create agents",
    eyebrow: "Assistants",
    description:
      "Shape the bots that will answer, qualify, route and operate inside this workspace.",
    href: "/dashboard/assistants/agents",
    icon: Bot,
    cta: "Open agents",
    checkpoints: ["Role", "Tone", "Launch"],
    accentGradient: "linear-gradient(90deg, #0284c7, #06b6d4, #65a30d)",
    iconClassName: "border-sky-200 bg-sky-50 text-sky-700",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    title: "Add knowledge",
    eyebrow: "Knowledge",
    description:
      "Collect the documents, pages and source text your agents should trust first.",
    href: "/dashboard/knowledge-base/general",
    icon: Database,
    cta: "Manage sources",
    checkpoints: ["Docs", "Websites", "Text"],
    accentGradient: "linear-gradient(90deg, #7c3aed, #db2777, #f97316)",
    iconClassName: "border-violet-200 bg-violet-50 text-violet-700",
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    title: "Import tables",
    eyebrow: "Data",
    description:
      "Turn structured files into clean lookup tables for pricing, inventory and records.",
    href: "/dashboard/knowledge-base/tables",
    icon: Table2,
    cta: "Review tables",
    checkpoints: ["Upload", "Map", "Query"],
    accentGradient: "linear-gradient(90deg, #059669, #14b8a6, #eab308)",
    iconClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    title: "Edit workspace",
    eyebrow: "Settings",
    description:
      "Keep goals, team context and launch details aligned with how this workspace runs.",
    href: "/dashboard/settings/general",
    icon: Settings2,
    cta: "Tune profile",
    checkpoints: ["Profile", "Team", "Goal"],
    accentGradient: "linear-gradient(90deg, #dc2626, #f97316, #2563eb)",
    iconClassName: "border-rose-200 bg-rose-50 text-rose-700",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
  },
];

const teamSizeLabels: Record<string, string> = {
  solo: "Solo",
  "2_5": "2-5",
  "6_20": "6-20",
  "21_100": "21-100",
  "100_plus": "100+",
};

const timelineLabels: Record<string, string> = {
  this_week: "This week",
  this_month: "This month",
  this_quarter: "This quarter",
  exploring: "Exploring",
};

function formatProfileValue(
  value: string | undefined,
  labels: Record<string, string> = {},
) {
  if (!value) {
    return "Not set";
  }

  return (
    labels[value] ??
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function getWorkspaceTypeLabel(workspace?: Workspace | null) {
  if (workspace?.businessType === "company") {
    return "Company";
  }

  return "Personal";
}

function getWorkspaceFocus(workspace?: Workspace | null) {
  const profile = workspace?.profile;

  return (
    profile?.successMetric ||
    profile?.goals?.[0] ||
    profile?.useCases?.[0] ||
    "Ready for a clear first agent"
  );
}

export default function DashboardPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const profile = activeWorkspace?.profile ?? {};
  const workspaceHighlights = [
    {
      label: "Workspace",
      value: getWorkspaceTypeLabel(activeWorkspace),
    },
    {
      label: "Team",
      value: formatProfileValue(profile.teamSize, teamSizeLabels),
    },
    {
      label: "Launch",
      value: formatProfileValue(profile.launchTimeline, timelineLabels),
    },
  ];

  return (
    <section className="flex w-full flex-col gap-5">
      <header className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="relative p-5 sm:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.055)_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <WorkspaceLogo
                    id={activeWorkspace?.id}
                    name={activeWorkspace?.name}
                    businessType={activeWorkspace?.businessType}
                    className="size-12 rounded-xl text-sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                      Active workspace
                    </p>
                    <h1 className="mt-2 truncate text-2xl font-semibold tracking-normal sm:text-3xl">
                      {activeWorkspace?.name}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Agents, knowledge, tables and workspace settings are now
                      grouped into one operational command center.
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/onboarding/workspace?mode=create">
                    New workspace
                  </Link>
                </Button>
              </div>

              <div className="grid divide-y border-y bg-white/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {workspaceHighlights.map((item) => (
                  <div key={item.label} className="px-0 py-3 sm:px-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t bg-[linear-gradient(135deg,#fafafa_0%,#f4fbff_48%,#f7fff4_100%)] p-5 text-zinc-950 lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500 uppercase">
                  Workspace pulse
                </p>
                <p className="mt-2 text-lg font-semibold">Setup map</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm">
                <Layers3 className="size-5" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 divide-x divide-zinc-200/80 border-y border-zinc-200/80 py-3">
              <div>
                <p className="text-xl font-semibold">4</p>
                <p className="mt-1 text-xs text-zinc-500">areas</p>
              </div>
              <div className="px-4">
                <p className="text-xl font-semibold">{workspaces.length}</p>
                <p className="mt-1 text-xs text-zinc-500">spaces</p>
              </div>
              <div className="pl-4">
                <p className="text-xl font-semibold">1</p>
                <p className="mt-1 text-xs text-zinc-500">focus</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-medium text-zinc-500">
                Primary outcome
              </p>
              <p className="text-sm leading-6 text-zinc-700">
                {getWorkspaceFocus(activeWorkspace)}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-3/4 rounded-full bg-[linear-gradient(90deg,#0284c7,#14b8a6,#84cc16)]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative isolate min-h-[260px] overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: action.accentGradient }}
            />
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-lg border ${action.iconClassName}`}
              >
                <action.icon className="size-5" />
              </div>
              <span
                className={`rounded-md border px-2 py-1 text-xs font-medium ${action.badgeClassName}`}
              >
                {action.eyebrow}
              </span>
            </div>

            <h2 className="mt-5 text-base font-semibold tracking-normal">
              {action.title}
            </h2>
            <p className="mt-2 min-h-[60px] text-sm leading-5 text-muted-foreground">
              {action.description}
            </p>

            <div className="mt-5 space-y-2">
              {action.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-600"
                >
                  <CheckCircle2 className="size-3.5 text-zinc-400" />
                  <span>{checkpoint}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-medium">
              <span>{action.cta}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
