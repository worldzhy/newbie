"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsRequiredStateProps {
  /** Short headline shown below the icon, e.g. "AWS credential required". */
  title: string;
  /** Explanation of which setting is missing and why it is needed. */
  description?: ReactNode;
  /** Destination of the settings call-to-action, usually the project settings page. */
  settingsHref: string;
  /** Label of the call-to-action button. */
  actionLabel?: string;
  /** Optional custom icon rendered inside the tinted badge. */
  icon?: ReactNode;
  /** Stretch the state to fill the parent height (used by full-screen panels). */
  fullHeight?: boolean;
  /** Allow callers to tweak the outer container when needed. */
  className?: string;
}

/**
 * Unified "required settings are missing" state. Feature modules render this
 * when their backing configuration has not been set up yet, so the
 * empty-state visuals and the settings entry point stay consistent.
 */
export function SettingsRequiredState({
  title,
  description,
  settingsHref,
  actionLabel = "Open Settings",
  icon,
  fullHeight = false,
  className,
}: SettingsRequiredStateProps) {
  return (
    <div className={cn("flex w-full items-center justify-center", fullHeight ? "h-full" : "py-8 md:py-16", className)}>
      <Card className="w-full max-w-xl text-center">
        <CardContent className="flex flex-col items-center px-6 py-10 md:px-12">
          {/* Tinted icon badge */}
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon ?? <Settings2 className="size-8" />}
          </div>

          <h2 className="text-lg font-semibold text-foreground">{title}</h2>

          {description ? <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p> : null}

          {/* settingsHref may be a full in-app path; Link handles client-side navigation. */}
          <Button asChild className="mt-6">
            <Link href={settingsHref}>
              {actionLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
