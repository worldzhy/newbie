"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { House, type LucideIcon } from "lucide-react";
import { cn } from "cn";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarCollapseToggle, SidebarNavLink, useSidebarCollapsed } from "@/components/app-shell/sidebar-chrome";

export interface AppShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Render as a non-clickable placeholder for upcoming features. */
  disabled?: boolean;
}

// Placeholder navigation; replace with the project's own entries.
const NAV_ITEMS: AppShellNavItem[] = [{ href: "/", label: "Home", icon: House }];

interface AppShellProps {
  children: React.ReactNode;
  navItems?: AppShellNavItem[];
}

// Minimal collapsible app shell: a 240px sidebar that folds to a 64px icon
// rail (preference persisted by useSidebarCollapsed) next to the page body.
export function AppShell({ children, navItems = NAV_ITEMS }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <aside className={cn("flex shrink-0 flex-col border-r border-border", collapsed ? "w-16" : "w-60")}>
          <nav className="flex-1 px-2 py-2">
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
                collapsed={collapsed}
                disabled={item.disabled}
              />
            ))}
          </nav>
          <SidebarCollapseToggle
            collapsed={collapsed}
            onToggle={setCollapsed}
            collapseLabel="Collapse"
            expandLabel="Expand sidebar"
          />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </TooltipProvider>
  );
}
