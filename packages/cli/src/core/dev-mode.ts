import {
  ApplicationMode,
  DeveloperMode,
  NEWBIE_DEVELOPER_ENV,
} from "../constants/modes";

/**
 * Resolve the NEWBIE_DEVELOPER env flag.
 * Unset means "newbie developer" (legacy default); only an explicit value
 * other than "true" switches to application developer.
 * Reading is side-effect free: a missing .env does NOT create the file.
 */
export function isNewbieDeveloperEnabled(
  envValues: Record<string, string>,
): boolean {
  return (
    !(NEWBIE_DEVELOPER_ENV in envValues) ||
    envValues[NEWBIE_DEVELOPER_ENV] === "true"
  );
}

export interface DeveloperModeDecision {
  allowed: boolean;
  /** When set, the caller should persist this mode to config.json. */
  persist?: string;
}

/**
 * Pure port of the legacy checkDeveloperMode() branching:
 * - unknown stored mode: sync it from env (allowed only with no modules yet)
 * - stored mode matches env: allow
 * - mismatch with zero enabled modules: switch silently
 * - mismatch with enabled modules: deny and print migration instructions
 */
export function decideDeveloperMode(
  storedMode: string | null | undefined,
  isNewbieDeveloper: boolean,
  enabledModules: string[],
): DeveloperModeDecision {
  const targetMode = isNewbieDeveloper
    ? DeveloperMode.NEWBIE_DEVELOPER
    : DeveloperMode.APPLICATION_DEVELOPER;

  const validModes = Object.values(DeveloperMode);
  if (!validModes.includes(storedMode as (typeof validModes)[number])) {
    if (enabledModules.length === 0)
      return { allowed: true, persist: targetMode };
    return { allowed: false, persist: targetMode };
  }

  const wasNewbieDeveloper = storedMode === DeveloperMode.NEWBIE_DEVELOPER;
  if (wasNewbieDeveloper === isNewbieDeveloper) {
    return { allowed: true };
  }

  if (enabledModules.length === 0) {
    return { allowed: true, persist: targetMode };
  }

  return { allowed: false };
}

export function isValidApplicationMode(mode: unknown): boolean {
  return (Object.values(ApplicationMode) as string[]).includes(mode as string);
}
