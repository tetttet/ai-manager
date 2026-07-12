"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BadgeCheck,
  Bell,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Pencil,
  Plus,
  Sparkles,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardNavGroups } from "@/components/dashboard/navigation";
import { UserAvatar } from "../ui/user-avatar";
import { getInitials } from "@/services/get-initials";
import {
  agentsUpdatedEventName,
  createRemoteAgentRepository,
  type Agent,
} from "@/lib/agent-repository";
import { useWorkspace } from "@/components/dashboard/workspace-provider";
import { AgentLogo } from "@/components/dashboard/agent-logo";
import { WorkspaceLogo } from "@/components/dashboard/workspace-logo";

export function AppSidebar() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const {
    accountId,
    getToken,
    activeWorkspace,
    activeWorkspaceId,
    workspaces,
    selectWorkspace,
  } = useWorkspace();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(true);
  const [agentsError, setAgentsError] = React.useState<string | null>(null);
  const activeWorkspaceLabel =
    activeWorkspace?.businessType === "company" ? "Company" : "Personal";
  const displayName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses[0]?.emailAddress ||
    "Signed in";
  const initials = getInitials(displayName, displayEmail);
  const isUserReady = isLoaded && Boolean(user);
  const isAgentsPage = pathname === "/dashboard/assistants/agents";

  React.useEffect(() => {
    let shouldIgnore = false;

    async function loadAgents() {
      if (!isLoaded) {
        return;
      }

      if (!accountId || !activeWorkspaceId) {
        setAgents([]);
        setAgentsError(null);
        setIsLoadingAgents(false);
        return;
      }

      try {
        setIsLoadingAgents(true);
        setAgentsError(null);
        const storedAgents = await createRemoteAgentRepository({
          getToken,
          workspaceId: activeWorkspaceId,
        }).listAgents();

        if (!shouldIgnore) {
          setAgents(storedAgents);
        }
      } catch {
        if (!shouldIgnore) {
          setAgents([]);
          setAgentsError("Agents unavailable");
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoadingAgents(false);
        }
      }
    }

    void loadAgents();
    window.addEventListener(agentsUpdatedEventName, loadAgents);

    return () => {
      shouldIgnore = true;
      window.removeEventListener(agentsUpdatedEventName, loadAgents);
    };
  }, [accountId, activeWorkspaceId, getToken, isLoaded]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <WorkspaceLogo
                    id={activeWorkspace?.id}
                    name={activeWorkspace?.name}
                    businessType={activeWorkspace?.businessType}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeWorkspace?.name ?? "Workspace"}
                    </span>
                    <span className="truncate text-xs">
                      {activeWorkspaceLabel}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                {workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => selectWorkspace(workspace.id)}
                    className="gap-2 p-2"
                  >
                    <WorkspaceLogo
                      id={workspace.id}
                      name={workspace.name}
                      businessType={workspace.businessType}
                      size="sm"
                    />
                    <span>{workspace.name}</span>
                    <DropdownMenuShortcut>
                      {workspace.id === activeWorkspaceId ? "✓" : `⌘${index + 1}`}
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/dashboard/settings/general">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Pencil className="size-4" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      Edit workspace
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 p-2">
                  <Link href="/onboarding/workspace?mode=create">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <span className="font-medium text-muted-foreground">
                      New workspace
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {dashboardNavGroups.map((group, index) => {
              const isGroupActive = group.items.some(
                (item) => pathname === item.href,
              );

              if (group.title === "Settings") {
                const item = group.items[0];

                return (
                  <SidebarMenuItem key={group.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={group.title}
                    >
                      <Link href={item.href}>
                        <group.icon />
                        <span>{group.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={group.title}
                  asChild
                  defaultOpen={index === 0 || isGroupActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.title}>
                        <group.icon />
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === item.href}
                            >
                              <Link href={item.href}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Agents</SidebarGroupLabel>
          <SidebarMenu>
            {isLoadingAgents ? (
              Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuItem key={`agent-skeleton-${index}`}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))
            ) : agents.length > 0 ? (
              agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isAgentsPage}
                    tooltip={`${agent.name} - ${agent.status}`}
                  >
                    <Link href="/dashboard/assistants/agents">
                      <AgentLogo id={agent.id} name={agent.name} size="xs" />
                      <span>{agent.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isAgentsPage}
                  tooltip={agentsError ?? "Agents"}
                >
                  <Link href="/dashboard/assistants/agents">
                    <Bot />
                    <span>{agentsError ?? "No agents yet"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  disabled={!isUserReady}
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {isUserReady ? (
                    <UserAvatar
                      imageUrl={user?.imageUrl}
                      initials={initials}
                      name={displayName}
                    />
                  ) : (
                    <Skeleton className="size-8 rounded-lg" />
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {isUserReady ? (
                      <>
                        <span className="truncate font-semibold">
                          {displayName}
                        </span>
                        <span className="truncate text-xs">{displayEmail}</span>
                      </>
                    ) : (
                      <>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-1 h-3 w-32" />
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserAvatar
                      imageUrl={user?.imageUrl}
                      initials={initials}
                      name={displayName}
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>
                      <span className="truncate text-xs">{displayEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openUserProfile()}>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => void signOut({ redirectUrl: "/login" })}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
