import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

/**
 * Shared eslint flat config for Next.js codebases
 * (nightwatch-frontend, fewbie-starter).
 *
 * Repo-specific rules and ignores belong in the consumer's own
 * eslint.config.mjs, spread after this entry.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Framework-generated artifacts; consumers append their own ignores.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
