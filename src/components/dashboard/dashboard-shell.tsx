"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { getDashboardBreadcrumbs } from "@/components/dashboard/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const breadcrumbs = getDashboardBreadcrumbs(pathname)

  return (
    <SidebarProvider defaultWidth="17rem">
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <div className="flex min-w-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="-ml-1" />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                Toggle sidebar
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                {breadcrumbs.map((breadcrumb, index) => (
                  <Fragment key={breadcrumb}>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="truncate">
                        {breadcrumb}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="relative hidden w-full max-w-sm md:block">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search"
                placeholder="Search agents, runs, prompts"
                className="pl-8"
              />
            </div>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <main className="flex w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-5">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
