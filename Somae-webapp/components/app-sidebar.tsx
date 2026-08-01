"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  SparklesIcon, 
  CreditCardIcon, 
  LayoutDashboardIcon, 
  ArrowLeftRightIcon, 
  WorkflowIcon, 
  BoxesIcon,
  Settings2Icon
} from "lucide-react"

// This is sample data customized for Huenxt.
const data = {
  teams: [
    {
      name: "Huenxt",
      logo: (
        <SparklesIcon className="size-4" />
      ),
      plan: "AI Automation",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon className="size-4" />
      ),
    },
    {
      title: "Workflow Builder",
      url: "/dashboard/workflows",
      icon: (
        <WorkflowIcon className="size-4" />
      ),
    },
    {
      title: "Pricing",
      url: "/pricing",
      icon: (
        <CreditCardIcon className="size-4" />
      ),
    }
  ],
  projects: [
    {
      name: "Building Blocks",
      url: "/dashboard/blocks",
      icon: (
        <BoxesIcon className="size-4" />
      ),
    },
    {
      name: "AI Settings",
      url: "/dashboard/settings",
      icon: (
        <Settings2Icon className="size-4" />
      ),
    },
    {
      name: "Go to Home",
      url: "/",
      icon: (
        <ArrowLeftRightIcon className="size-4" />
      ),
    }
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const defaultUser = {
    name: "User",
    email: "user@huenxt.ai",
    avatar: "https://avatar.iran.liara.run/public/32"
  }

  const mergedUser = user ? {
    name: user.name || "User",
    email: user.email || "",
    avatar: user.avatar || "https://avatar.iran.liara.run/public/32"
  } : defaultUser

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={mergedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
