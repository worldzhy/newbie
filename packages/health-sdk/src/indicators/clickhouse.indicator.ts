import type { NamedHealthIndicator } from "../types";

/**
 * Health indicator for ClickhouseService.
 *
 * Duck-types the service for a `query` method and runs `SELECT 1` to verify
 * the ClickHouse HTTP connection is alive.
 */
export function createClickhouseIndicator(service: unknown): NamedHealthIndicator {
  return {
    name: "clickhouse",
    check: async () => {
      const query = (service as Record<string, unknown>)?.query;
      if (typeof query !== "function") {
        return { status: "down", message: "query method not available" };
      }
      try {
        await (query as (opts: { query: string }) => Promise<unknown>)({
          query: "SELECT 1",
        });
        return { status: "up" };
      } catch (err) {
        return { status: "down", message: (err as Error)?.message ?? String(err) };
      }
    },
  };
}
