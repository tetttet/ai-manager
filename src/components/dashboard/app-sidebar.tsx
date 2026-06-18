"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BadgeCheck,
  Bell,
  BrainCircuit,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  LogOut,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardNavGroups,
  dashboardProjects,
} from "@/components/dashboard/navigation";
import { UserAvatar } from "../ui/user-avatar";
import { getInitials } from "@/services/get-initials";

const data = {
  workspaces: [
    {
      name: "AI Manager",
      logo: Command,
      plan: "Pro",
    },
    {
      name: "Hermes Core",
      logo: BrainCircuit,
      plan: "Dev",
    },
    {
      name: "Launch Lab",
      logo: Sparkles,
      plan: "Beta",
    },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [activeWorkspace, setActiveWorkspace] = React.useState(
    data.workspaces[0],
  );
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
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <activeWorkspace.logo className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeWorkspace.name}
                    </span>
                    <span className="truncate text-xs">
                      {activeWorkspace.plan}
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
                {data.workspaces.map((workspace, index) => (
                  <DropdownMenuItem
                    key={workspace.name}
                    onClick={() => setActiveWorkspace(workspace)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <workspace.logo className="size-4 shrink-0" />
                    </div>
                    <span>{workspace.name}</span>
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <span className="font-medium text-muted-foreground">
                    New workspace
                  </span>
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
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            {dashboardProjects.map((project) => (
              <SidebarMenuItem key={project.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === project.href}
                  tooltip={project.title}
                >
                  <Link href={project.href}>
                    <project.icon />
                    <span>{project.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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
