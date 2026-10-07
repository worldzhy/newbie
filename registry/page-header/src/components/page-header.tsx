import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Main page title, usually matching the sidebar entry label. */
  title: ReactNode;
  /** Optional short explanation rendered under the title. */
  subtitle?: ReactNode;
  /** Optional action area (buttons, filters) aligned to the right. */
  actions?: ReactNode;
  /** Augment the outer container (e.g. override the default mb-6 margin). */
  className?: string;
}

/**
 * Standard page header: title with optional subtitle on the left and an
 * actions slot on the right. Keeps title typography and spacing consistent
 * across feature modules so each page does not render its own header variant.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
