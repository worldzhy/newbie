/**
 * Pure selection rules shared by the interactive `newbie` flow and `newbie config`.
 *
 * SaaS applications cannot enable the standalone account module (they ship the
 * built-in saas module instead), and non-SaaS applications never see saas.
 */

export const SAAS_MODULE = "saas";
export const ACCOUNT_MODULE = "account";

export function selectableModules(
  allModuleNames: string[],
  applicationMode: string | null,
  isSaasApplication: boolean,
): string[] {
  const excluded = isSaasApplication ? ACCOUNT_MODULE : SAAS_MODULE;
  return allModuleNames.filter((name) => name !== excluded);
}

/** Validate a user-supplied module list against the catalog and de-duplicate. */
export function sanitizeModuleNames(
  names: string[],
  catalogKeys: ReadonlySet<string>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names.map((name) => name.trim())) {
    if (!catalogKeys.has(name) || seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }
  return result;
}
