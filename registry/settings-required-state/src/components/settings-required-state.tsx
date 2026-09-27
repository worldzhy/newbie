import type { ReactNode } from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

interface SettingsRequiredStateProps {
  title: string;
  description: string;
  /** Label for the primary call-to-action button. */
  actionLabel: string;
  /** Called when the user clicks the primary action. */
  onAction: () => void;
  /** Optional secondary action (e.g. learn more link). */
  secondary?: ReactNode;
}

/**
 * Empty state shown when a feature requires setup that has not been completed.
 * Renders a card with an icon, explanatory text, and a primary action button.
 */
export function SettingsRequiredState({
  title,
  description,
  actionLabel,
  onAction,
  secondary,
}: SettingsRequiredStateProps) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Setup required" description="Complete configuration to continue." />
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Settings className="size-6 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button onClick={onAction} className="w-full sm:w-auto">
            {actionLabel}
          </Button>
          {secondary}
        </CardContent>
      </Card>
    </div>
  );
}
