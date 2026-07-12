import {
  BookOpenText,
  Bot,
  ChartNoAxesColumnIncreasing,
  CircleGauge,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings2,
  SquareActivity,
  Table2,
  UserRoundCog,
  Workflow,
} from "lucide-react"

export const dashboardNavGroups = [
  {
    title: "Overview",
    icon: CircleGauge,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Activity",
        href: "/dashboard/activity",
        icon: SquareActivity,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: ChartNoAxesColumnIncreasing,
      },
    ],
  },
  {
    title: "Assistants",
    icon: Bot,
    items: [
      {
        title: "Agents",
        href: "/dashboard/assistants/agents",
        icon: UserRoundCog,
      },
    ],
  },
  {
    title: "Knowledge Base",
    icon: BookOpenText,
    items: [
      {
        title: "General",
        href: "/dashboard/knowledge-base/general",
        icon: Settings2,
      },
      {
        title: "Tables",
        href: "/dashboard/knowledge-base/tables",
        icon: Table2,
      },
      {
        title: "Instructions",
        href: "/dashboard/knowledge-base/instructions",
        icon: FileText,
      },
    ],
  },
  {
    title: "Workflows",
    icon: Workflow,
    items: [
      {
        title: "Runs",
        href: "/dashboard/workflows/runs",
        icon: ListChecks,
      },
      {
        title: "Queues",
        href: "/dashboard/workflows/queues",
        icon: Workflow,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        href: "/dashboard/settings/general",
        icon: Settings2,
      },
    ],
  },
]

export const dashboardProjects = [
  {
    title: "Бот Артур",
    href: "/dashboard/projects/bot-artur",
    icon: FolderKanban,
  },
]

export function getDashboardBreadcrumbs(pathname: string) {
  for (const group of dashboardNavGroups) {
    const item = group.items.find((navItem) => navItem.href === pathname)

    if (item) {
      return [group.title, item.title]
    }
  }

  const project = dashboardProjects.find((item) => item.href === pathname)

  if (project) {
    return ["Projects", project.title]
  }

  return ["Overview", "Dashboard"]
}
