import type { HealthCheckResult, HealthIndicatorEntry, NamedHealthIndicator } from "./types";

/**
 * Run all health indicators in parallel with a per-check timeout.
 *
 * Each indicator is wrapped in a Promise.race against a timeout timer so a
 * single unresponsive dependency cannot stall the whole report. If an
 * indicator throws or times out, it is recorded as "down" with the error
 * message — no indicator is ever silently dropped.
 */
export async function runCheck(
  indicators: NamedHealthIndicator[],
  timeoutMs = 1500,
): Promise<HealthCheckResult> {
  if (indicators.length === 0) {
    return { status: "ok", info: {} };
  }

  const entries = await Promise.all(
    indicators.map(
      async ({ name, check }): Promise<{ name: string; entry: HealthIndicatorEntry }> => {
        try {
          const entry = await Promise.race<Promise<HealthIndicatorEntry>>([
            check(),
            new Promise<HealthIndicatorEntry>((_, reject) =>
              setTimeout(
                () => reject(new Error(`timeout after ${timeoutMs}ms`)),
                timeoutMs,
              ),
            ),
          ]);
          return { name, entry };
        } catch (err) {
          const message = (err as Error)?.message ?? String(err);
          return { name, entry: { status: "down", message } };
        }
      },
    ),
  );

  const info: Record<string, HealthIndicatorEntry> = {};
  let allOk = true;

  for (const { name, entry } of entries) {
    info[name] = entry;
    if (entry.status !== "up") allOk = false;
  }

  return { status: allOk ? "ok" : "error", info };
}
