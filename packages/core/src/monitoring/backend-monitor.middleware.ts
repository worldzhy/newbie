import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { MonitorEventReporter } from "./backend-monitor.reporter";
import {
  getMonitorMeta,
  isMonitoringTraffic,
  routeTemplate,
  safePathname,
  setMonitorMeta,
} from "./request-meta.util";

/**
 * Collects one request metric per inbound HTTP request.
 *
 * Runs on every route but is registered only when monitoring is enabled.
 * All capture work happens on response 'finish' and consists of object
 * allocation plus a bounded queue push — it never performs I/O and never
 * throws into the application's response path.
 */
@Injectable()
export class BackendMonitorMiddleware implements NestMiddleware {
  constructor(private readonly reporter: MonitorEventReporter) {}

  use(request: Request, response: Response, next: NextFunction): void {
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
      this.reporter.enqueueRequest({
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
  }
}
