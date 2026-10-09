import type { NamedHealthIndicator } from "../types";

/**
 * Health indicator for RedisService.
 *
 * Duck-types the service for a `getClient` method and pings the underlying
 * ioredis client to verify the connection is alive.
 */
export function createRedisIndicator(service: unknown): NamedHealthIndicator {
  return {
    name: "redis",
    check: async () => {
      const getClient = (service as Record<string, unknown>)?.getClient;
      if (typeof getClient !== "function") {
        return { status: "down", message: "getClient method not available" };
      }
      try {
        const client = (getClient as () => unknown).call(service) as
          | { ping?: () => Promise<string> }
          | undefined;
        if (!client || typeof client.ping !== "function") {
          return { status: "down", message: "redis client not initialized" };
        }
        await client.ping();
        return { status: "up" };
      } catch (err) {
        return { status: "down", message: (err as Error)?.message ?? String(err) };
      }
    },
  };
}
