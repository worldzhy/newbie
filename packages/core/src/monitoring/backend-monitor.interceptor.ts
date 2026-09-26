import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MonitorEventReporter } from "./backend-monitor.reporter";
import {
  getMonitorMeta,
  routeTemplate,
  safePathname,
} from "./request-meta.util";

/**
 * Observes unhandled exceptions and enqueues an error event sharing the
 * request's correlation id. The exception is only observed — it continues to
 * propagate to the framework's exception-filter chain, so response behaviour
 * is unchanged. Process-level errors (no request meta, e.g. the loop path)
 * are not reported here.
 */
@Injectable()
export class BackendMonitorInterceptor implements NestInterceptor {
  constructor(private readonly reporter: MonitorEventReporter) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap({
        error: (exception: unknown) => {
          this.capture(context, exception);
        },
      }),
    );
  }

  private capture(context: ExecutionContext, exception: unknown): void {
    const request = context.switchToHttp().getRequest<Request>();
    const meta = getMonitorMeta(request);
    if (!meta) return;

    this.reporter.enqueueError({
      requestId: meta.requestId,
      type:
        (exception as { constructor?: { name?: string } })?.constructor?.name ??
        "UnknownError",
      message:
        exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      route: routeTemplate(request),
      path: safePathname(request),
      method: request.method.toUpperCase(),
      statusCode:
        exception instanceof HttpException ? exception.getStatus() : 500,
      ip: request.ip,
      userAgent: request.headers["user-agent"],
      occurredAt: new Date().toISOString(),
    });
  }
}
