import {INestApplication} from '@nestjs/common';
import http from 'node:http';

/**
 * Bounded graceful shutdown for production-style runs.
 *
 * NestJS's default shutdown hooks call `server.close()`, which stops accepting
 * new connections but waits INDEFINITELY for in-flight requests to finish.
 * Behind load balancers and reporting agents there are almost always idle
 * keep-alive sockets and occasional long-running requests, so an unbounded
 * wait means the process never exits and the orchestrator has to SIGKILL it
 * (losing the graceful cleanup the hooks were supposed to provide).
 *
 * Strategy on the first SIGTERM/SIGINT:
 *  1. Immediately destroy idle keep-alive connections (no request is lost).
 *  2. Run the Nest shutdown sequence (onModuleDestroy, HTTP server close).
 *  3. If in-flight requests are still holding sockets after `timeoutMs`,
 *     destroy ALL connections so server.close() unblocks.
 *  4. Exit 0. A second signal exits 1 without further waiting.
 */
export function registerGracefulShutdown(
  app: INestApplication,
  server: http.Server,
  timeoutMs = 10_000
): void {
  let shuttingDown = false;

  const handleSignal = (): void => {
    // Second signal: the operator (or orchestrator) wants out now.
    if (shuttingDown) {
      process.exit(1);
    }
    shuttingDown = true;
    console.log(`[shutdown] Received shutdown signal, draining for up to ${timeoutMs}ms...`);

    // Idle keep-alive sockets carry no in-flight request and can be dropped now.
    server.closeIdleConnections?.();

    // Hard cap: destroy still-busy sockets (long-running/streaming requests).
    const forceTimer = setTimeout(() => {
      console.warn('[shutdown] Grace period exceeded, forcing all connections closed.');
      server.closeAllConnections?.();
    }, timeoutMs);
    // Do not let the timer itself keep the event loop alive.
    forceTimer.unref?.();

    // app.close() runs module destroy hooks and then closes the HTTP server.
    app
      .close()
      .then(() => {
        clearTimeout(forceTimer);
        process.exit(0);
      })
      .catch(err => {
        clearTimeout(forceTimer);
        console.error('[shutdown] Error during graceful shutdown:', err);
        process.exit(1);
      });
  };

  process.on('SIGTERM', handleSignal);
  process.on('SIGINT', handleSignal);
}
