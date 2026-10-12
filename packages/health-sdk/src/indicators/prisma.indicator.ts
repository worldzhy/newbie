import type { NamedHealthIndicator } from "../types";

/**
 * Health indicator for PrismaService.
 *
 * Duck-types the service for `$queryRaw` (present on any PrismaClient) and
 * runs a lightweight `SELECT 1` to verify the database connection is alive.
 */
export function createPrismaIndicator(service: unknown): NamedHealthIndicator {
  return {
    name: "prisma",
    check: async () => {
      // The PrismaService instance is a Proxy that forwards to the
      // underlying PrismaClient, so $queryRaw is available at runtime.
      const queryRaw = (service as Record<string, unknown>)?.$queryRaw;
      if (typeof queryRaw !== "function") {
        return { status: "down", message: "$queryRaw not available" };
      }
      try {
        await (queryRaw as (strings: TemplateStringsArray) => Promise<unknown>)`SELECT 1`;
        return { status: "up" };
      } catch (err) {
        return { status: "down", message: (err as Error)?.message ?? String(err) };
      }
    },
  };
}
