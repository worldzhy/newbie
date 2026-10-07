"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

export const DEFAULT_SIDEBAR_COLLAPSED_STORAGE_KEY = "app-shell:sidebar-collapsed";

// External stores keyed by storage key, so every sidebar shell sharing a key
// shares one preference without setState-in-effect hydration churn. Sidebars
// render expanded on the server; the stored value is applied after hydration.
interface SidebarCollapsedStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => boolean;
  set: (value: boolean) => void;
}

const collapsedStores = new Map<string, SidebarCollapsedStore>();

function getCollapsedStore(storageKey: string): SidebarCollapsedStore {
  const existing = collapsedStores.get(storageKey);
  if (existing) return existing;

  const listeners = new Set<() => void>();
  const store: SidebarCollapsedStore = {
    subscribe(callback) {
      listeners.add(callback);
      window.addEventListener("storage", callback);
      return () => {
        listeners.delete(callback);
        window.removeEventListener("storage", callback);
      };
    },
    getSnapshot() {
      return window.localStorage.getItem(storageKey) === "1";
    },
    set(value) {
      window.localStorage.setItem(storageKey, value ? "1" : "0");
      listeners.forEach((listener) => listener());
    },
  };
  collapsedStores.set(storageKey, store);
  return store;
}

export function useSidebarCollapsed(
  storageKey: string = DEFAULT_SIDEBAR_COLLAPSED_STORAGE_KEY,
): [boolean, (value: boolean) => void] {
  const store = getCollapsedStore(storageKey);
  const collapsed = React.useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
  return [collapsed, store.set];
}

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
  /** Render as a non-clickable placeholder for upcoming features. */
  disabled?: boolean;
  /** Native hover title explaining why the entry is disabled. */
  disabledHint?: string;
}

// Leaf navigation row: full row when expanded, centered icon button with a
// tooltip when collapsed.
export function SidebarNavLink({ href, label, icon: Icon, active, collapsed, disabled, disabledHint }: SidebarNavLinkProps) {
  const iconColor = disabled ? "text-muted-foreground/50" : active ? "text-primary" : "text-muted-foreground";

  const className = collapsed
    ? cn(
        "mx-auto mt-1 flex h-10 w-10 items-center justify-center rounded-md",
        disabled
          ? "cursor-not-allowed text-muted-foreground/50"
          : active
            ? "bg-accent font-semibold text-primary"
            : "text-foreground hover:bg-accent",
      )
    : cn(
        "mt-1 flex min-h-10 items-center gap-3 rounded-md px-4",
        disabled
          ? "cursor-not-allowed text-muted-foreground/50"
          : active
            ? "bg-accent font-semibold text-primary"
            : "text-foreground hover:bg-accent",
      );

  const inner = disabled ? (
    <div className={className} title={disabledHint} aria-disabled="true">
      <Icon className={cn("size-4", iconColor)} />
      {!collapsed && <span>{label}</span>}
    </div>
  ) : (
    <Link href={href} className={className} aria-current={active ? "page" : undefined}>
      <Icon className={cn("size-4", iconColor)} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (!collapsed) return inner;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

interface SidebarBackButtonProps {
  collapsed: boolean;
  label: string;
  backAriaLabel: string;
  onClick: () => void;
}

// Header button: wide back-to-list button when expanded, square icon when
// collapsed.
export function SidebarBackButton({ collapsed, label, backAriaLabel, onClick }: SidebarBackButtonProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={backAriaLabel}
        className="mx-auto flex size-10 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-foreground hover:border-primary hover:bg-accent hover:text-primary focus:outline-none"
      >
        <ArrowLeft className="size-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full max-w-[240px] cursor-pointer items-center rounded-md border border-border bg-card text-base font-medium text-foreground hover:border-primary hover:bg-accent hover:text-primary focus:outline-none"
    >
      <span className="flex w-14 items-center justify-center">
        <ArrowLeft className="size-5 text-muted-foreground" />
      </span>
      <span className="max-w-[170px] truncate pr-4 text-left">{label}</span>
    </button>
  );
}

interface SidebarCollapseToggleProps {
  collapsed: boolean;
  onToggle: (value: boolean) => void;
  collapseLabel: string;
  expandLabel: string;
}

// Footer button that flips the sidebar between 240px and 64px.
export function SidebarCollapseToggle({ collapsed, onToggle, collapseLabel, expandLabel }: SidebarCollapseToggleProps) {
  const button = (
    <button
      type="button"
      onClick={() => onToggle(!collapsed)}
      aria-label={collapsed ? expandLabel : collapseLabel}
      aria-expanded={!collapsed}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none",
        collapsed ? "justify-center" : "gap-2.5 px-3",
      )}
    >
      {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      {!collapsed && <span className="text-sm">{collapseLabel}</span>}
    </button>
  );

  return (
    <div className="shrink-0 border-t border-border p-2">
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{expandLabel}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </div>
  );
}

// Hairline divider replacing text group labels in collapsed mode.
export function CollapsedGroupDivider() {
  return <div className="mx-2 border-t border-border" />;
}

interface CollapsedFlyoutMenuProps {
  icon: LucideIcon;
  /** Trigger aria label and flyout title (e.g. a group name). */
  label: string;
  active: boolean;
  children: React.ReactNode;
}

// Hover-opened flyout for groups whose children do not fit in the 64px rail.
export function CollapsedFlyoutMenu({ icon: Icon, label, active, children }: CollapsedFlyoutMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [trackedPathname, setTrackedPathname] = React.useState(pathname);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close after navigation; the shell layout outlives page changes. Adjusting
  // state during render (React's documented prop-change pattern) avoids an
  // effect that fires after the destination page paints.
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    if (open) setOpen(false);
  }

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMenu = React.useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [cancelClose]);

  // Clear any pending close timer on unmount.
  React.useEffect(() => cancelClose, [cancelClose]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          aria-label={label}
          className={cn(
            "mx-auto mt-1 flex h-10 w-10 items-center justify-center rounded-md",
            active ? "bg-accent font-semibold text-primary" : "text-foreground hover:bg-accent",
          )}
        >
          <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        className="flex w-52 flex-col gap-0 p-1.5"
      >
        <h2 className="truncate px-2 py-1.5 text-sm">{label}</h2>
        {children}
      </PopoverContent>
    </Popover>
  );
}

interface FlyoutLinkProps {
  href: string;
  label: string;
  active: boolean;
  indented?: boolean;
}

export function FlyoutLink({ href, label, active, indented }: FlyoutLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md py-1.5 pr-2 text-sm",
        indented ? "pl-5" : "pl-2",
        active ? "bg-accent font-semibold text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function FlyoutSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</div>
  );
}
