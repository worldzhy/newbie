"use client";

import { useEffect } from "react";

/**
 * Browser-side monitoring bootstrap.
 *
 * Dynamically imports @devbie/web-monitor-sdk on mount and initializes it
 * with NEXT_PUBLIC_WEB_MONITOR_API (report endpoint) and
 * NEXT_PUBLIC_WEB_MONITOR_APP_ID. Renders nothing; it is a no-op until both
 * env vars are set. Heartbeat wiring is intentionally NOT handled here —
 * it lives in the template's instrumentation.ts (Node process only).
 *
 * The dynamic import keeps the SDK out of SSR/Edge evaluation entirely:
 * the monitor bundle is only loaded in the browser when the component mounts.
 */
export function WebMonitor() {
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_WEB_MONITOR_API;
    const appId = process.env.NEXT_PUBLIC_WEB_MONITOR_APP_ID;

    // Required configuration missing — stay silent in production, warn in dev.
    if (!api || !appId) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[WebMonitor] NEXT_PUBLIC_WEB_MONITOR_API / NEXT_PUBLIC_WEB_MONITOR_APP_ID not set; monitoring disabled.",
        );
      }
      return;
    }

    let disposed = false;

    void import("@devbie/web-monitor-sdk").then(({ default: init }) => {
      // StrictMode mounts effects twice in dev; guard against double init.
      if (disposed) return;
      init({
        appId,
        api,
        isPage: true,
        isAjax: true,
        isResource: true,
        isError: true,
      });
    });

    return () => {
      disposed = true;
    };
  }, []);

  return null;
}
