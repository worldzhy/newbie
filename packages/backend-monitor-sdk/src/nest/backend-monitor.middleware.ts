import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { MonitorEventReporter } from "../backend-monitor.reporter";
import { createExpressMonitorMiddleware } from "../express-monitor.middleware";
import type { ExpressMonitorMiddleware } from "../express-monitor.middleware";

/**
 * Nest adapter around the framework-agnostic express middleware: registers
 * request-metric capture for every route. All capture logic lives in
 * createExpressMonitorMiddleware; this class only performs the DI wiring.
 */
@Injectable()
export class BackendMonitorMiddleware implements NestMiddleware {
  private readonly handler: ExpressMonitorMiddleware;

  // Value import (not `import type`): the constructor parameter type feeds
  // Nest's emitted design:paramtypes metadata for DI resolution.
  constructor(reporter: MonitorEventReporter) {
    this.handler = createExpressMonitorMiddleware(reporter);
  }

  use(request: Request, response: Response, next: NextFunction): void {
    this.handler(request, response, next);
  }
}
