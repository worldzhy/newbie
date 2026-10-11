import type { INestApplication } from "@nestjs/common";
import { resolveBackendMonitorOptions } from "../backend-monitor.options";
import { MonitorEventReporter } from "../backend-monitor.reporter";
import type { BackendMonitorOptions } from "../backend-monitor.types";
import { createExpressMonitorMiddleware } from "../express-monitor.middleware";
import { BackendMonitorInterceptor } from "./backend-monitor.interceptor";

/** Handle returned by startBackendMonitoring for lifecycle control. */
export interface BackendMonitoringHandle {
  /** Stops the flush timer and releases the global singleton. */
  stop(): void;
}

const GLOBAL_KEY = Symbol.for("@devbie/backend-monitor-sdk:bootstrap");

/**
 * Function-style wiring for hosts that bootstrap without registering a
 * monitoring Nest module (e.g. @devbie/newbie's NewbieFactory): creates one
 * reporter, starts its flush timer, and registers the request middleware plus
 * the error interceptor directly on the given app instance.
 *
 * MUST be called before app.listen(): global interceptors registered after
 * listen do not take effect.
 *
 * Idempotent via a global singleton, so watch-mode/HMR re-bootstrap does not
 * double-register. Returns null when options.enabled is false. Do not combine
 * with BackendMonitorModule.forRoot() in the same process — registering both
 * paths emits duplicate events.
 */
export function startBackendMonitoring(
  app: INestApplication,
  options: BackendMonitorOptions,
): BackendMonitoringHandle | null {
  if (options.enabled === false) {
    return null;
  }

  const existing = (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
  if (existing) {
    return existing as BackendMonitoringHandle;
  }

  const reporter = new MonitorEventReporter(resolveBackendMonitorOptions({ ...options, enabled: true }));
  reporter.start();

  app.use(createExpressMonitorMiddleware(reporter));
  app.useGlobalInterceptors(new BackendMonitorInterceptor(reporter));

  const handle: BackendMonitoringHandle = {
    stop: () => {
      reporter.stop();
      delete (globalThis as Record<symbol, unknown>)[GLOBAL_KEY];
    },
  };

  (globalThis as Record<symbol, unknown>)[GLOBAL_KEY] = handle;
  return handle;
}
