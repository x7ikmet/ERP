"use client"

import * as React from "react"
import {
  IconDashboard,
  IconPackage,
  IconUsers,
  IconTruck,
  IconShoppingCart,
  IconReport,
  IconSettings,
  IconHelp,
  IconChartBar,
  IconBoxSeam,
  IconUserCog,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "ERP User",
    email: "user@erp.com", 
    avatar: "/avatars/user.svg",
  },
  navMain: [
    {
      title: "Dashboard", 
      url: "/",
      icon: IconDashboard,
    },
  ],
  businessModules: [
    {
      title: "Inventory",
      icon: IconBoxSeam,
      isActive: true,
      url: "/inventory",
      items: [
        {
          title: "Products",
          url: "/products",
        },
        {
          title: "Categories",
          url: "/categories",
        },
        {
          title: "Stock Management",
          url: "/inventory/stock",
        },
        {
          title: "Low Stock Alert",
          url: "/inventory/alerts",
        },
      ],
    },
    {
      title: "Sales",
      icon: IconShoppingCart,
      url: "/sales",
      items: [
        {
          title: "All Sales",
          url: "/sales",
        },
        {
          title: "New Sale",
          url: "/sales/new",
        },
        {
          title: "Draft Sales",
          url: "/sales?status=draft",
        },
        {
          title: "Completed Sales",
          url: "/sales?status=completed",
        },
        {
          title: "Sale Items",
          url: "/sale-items",
        },
      ],
    },
    {
      title: "Customers",
      icon: IconUsers,
      url: "/customers",
      items: [
        {
          title: "All Customers",
          url: "/customers",
        },
        {
          title: "Add Customer",
          url: "/customers/new",
        },
        {
          title: "Active Customers",
          url: "/customers?status=active",
        },
        {
          title: "Customer Sales",
          url: "/customers/sales",
        },
      ],
    },
    {
      title: "Suppliers",
      icon: IconTruck,
      url: "/suppliers",
      items: [
        {
          title: "All Suppliers",
          url: "/suppliers",
        },
        {
          title: "Add Supplier",
          url: "/suppliers/new",
        },
        {
          title: "Active Suppliers",
          url: "/suppliers?status=active",
        },
        {
          title: "Supplier Products",
          url: "/suppliers/products",
        },
      ],
    },
    {
      title: "Products",
      icon: IconPackage,
      url: "/products",
      items: [
        {
          title: "All Products",
          url: "/products",
        },
        {
          title: "Add Product",
          url: "/products/new",
        },
        {
          title: "Product Catalog",
          url: "/products/catalog",
        },
        {
          title: "Pricing Management",
          url: "/products/pricing",
        },
      ],
    },
    {
      title: "User Management",
      icon: IconUserCog,
      url: "/users",
      items: [
        {
          title: "All Users",
          url: "/users",
        },
        {
          title: "User Profile",
          url: "/users/profile",
        },
        {
          title: "User Permissions",
          url: "/users/permissions",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/help",
      icon: IconHelp,
    },
  ],
  analytics: [
    {
      title: "Analytics",
      url: "/analytics", 
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconReport,
    },
  ],
}

import { useAuth } from "@/contexts/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Prepare user data for NavUser component
  const userData = {
    name: user?.name || "ERP User",
    email: user?.email || "user@erp.com", 
    avatar: "/avatars/user.svg"
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconDashboard className="!size-5" />
                <span className="text-base font-semibold">ERP System</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} showQuickCreate={true} />
        
        <div className="px-3 py-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Business Operations</h4>
        </div>
        <NavMain items={data.businessModules} />
        
        <div className="px-3 py-2 border-t mt-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Analytics & Reports</h4>
          <NavSecondary items={data.analytics} keyPrefix="analytics" />
        </div>
        
        <NavSecondary items={data.navSecondary} keyPrefix="settings" className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
