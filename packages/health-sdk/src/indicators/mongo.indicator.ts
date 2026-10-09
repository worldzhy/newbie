import type { NamedHealthIndicator } from "../types";

/**
 * Health indicator for MongoModelRegistry.
 *
 * The registry wraps a Mongoose Connection (stored as a private field).
 * We access it at runtime and read `readyState`:
 *   0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting.
 * Only state 1 is considered "up".
 */
export function createMongoIndicator(service: unknown): NamedHealthIndicator {
  return {
    name: "mongo",
    check: async () => {
      const connection = (service as Record<string, unknown>)?.connection as
        | { readyState?: number }
        | undefined;
      if (!connection) {
        return { status: "down", message: "no mongoose connection" };
      }
      const ready = connection.readyState === 1;
      return {
        status: ready ? "up" : "down",
        message: `readyState=${connection.readyState}`,
      };
    },
  };
}
