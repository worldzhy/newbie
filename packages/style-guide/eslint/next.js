import { defineConfig, globalIgnores } from "eslint/config";
import core from "./core.js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

/**
 * Next.js standard for Next.js applications
 * (nightwatch-frontend, fewbie-starter).
 *
 * Extends the shared `core` baseline with the canonical Next rule set.
 * `eslint-config-next` already bundles the React / react-hooks / jsx-a11y
 * layers, so nothing else is layered on top: spreading another React layer
 * would redefine the same plugin and flat config rejects that.
 *
 * This entry can only be loaded where the `next` package is installed; Node
 * repos without a Next runtime use the `base` entry instead.
 */
export default defineConfig([
  ...core,
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Framework-generated artifacts; consumers append their own ignores.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
