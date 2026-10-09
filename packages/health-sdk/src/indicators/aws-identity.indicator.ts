import type { NamedHealthIndicator } from "../types";

/**
 * Health indicator for AwsCredentialsService.
 *
 * Duck-types the service for `resolveDefaultCredentials`, which returns a
 * credential provider (async function). Calling the provider resolves the
 * SDK default credential chain (env, shared config, EC2 metadata). If it
 * throws or times out (caught by runCheck's Promise.race), AWS is
 * effectively unavailable.
 */
export function createAwsIdentityIndicator(service: unknown): NamedHealthIndicator {
  return {
    name: "aws-identity",
    check: async () => {
      const resolve = (service as Record<string, unknown>)?.resolveDefaultCredentials;
      if (typeof resolve !== "function") {
        return { status: "down", message: "resolveDefaultCredentials not available" };
      }
      try {
        const provider = (resolve as () => unknown)();
        if (typeof provider !== "function") {
          return { status: "down", message: "credential provider not a function" };
        }
        await (provider as () => Promise<unknown>)();
        return { status: "up" };
      } catch (err) {
        return { status: "down", message: (err as Error)?.message ?? String(err) };
      }
    },
  };
}
