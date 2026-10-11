import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { MonitorEventReporter } from "./backend-monitor.reporter";
import { getMonitorMeta, isMonitoringTraffic, routeTemplate, safePathname, setMonitorMeta } from "./request-meta.util";

/** Signature of the created handler; directly compatible with app.use(). */
export type ExpressMonitorMiddleware = (request: Request, response: Response, next: NextFunction) => void;

/**
 * Creates a native Express middleware that collects one request metric per
 * inbound HTTP request.
 *
 * Runs on every route but is registered only when monitoring is enabled.
 * All capture work happens on response 'finish' and consists of object
 * allocation plus a bounded queue push — it never performs I/O and never
 * throws into the application's response path.
 *
 * Framework-less hosts register it directly (app.use(...)); the Nest adapter
 * wraps it in BackendMonitorMiddleware for the Nest middleware pipeline.
 */
export function createExpressMonitorMiddleware(reporter: MonitorEventReporter): ExpressMonitorMiddleware {
  return (request, response, next) => {
    // Break the self-reporting loop: ingest calls (tagged or on the ingest
    // path) are not themselves monitored.
    if (isMonitoringTraffic(request)) {
      next();
      return;
    }

    const startDate = new Date();
    setMonitorMeta(request, { requestId: randomUUID(), startDate });

    response.on("finish", () => {
      const meta = getMonitorMeta(request);
      if (!meta) return;
      reporter.enqueueRequest({
        requestId: meta.requestId,
        route: routeTemplate(request),
        path: safePathname(request),
        method: request.method.toUpperCase(),
        statusCode: response.statusCode,
        requestAt: meta.startDate.toISOString(),
        responseAt: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      });
    });

    next();
  };
}
