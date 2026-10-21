import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

/**
 * Next.js layer for the devbie ecosystem.
 *
 * This is a layer, not a standalone standard: compose it after `base`
 * (`export default [...base, ...next]`), so every repo shares the same
 * language-level rules while Next.js applications add only the canonical
 * framework rule set.
 *
 * `eslint-config-next` already bundles the React / react-hooks / jsx-a11y
 * layers, so nothing else is layered on top: spreading another React layer
 * would redefine the same plugin and flat config rejects that.
 *
 * This entry can only be loaded where the `next` package is installed; Node
 * repos without a Next runtime compose `base` with `nest` or nothing at all.
 *
 * `prettierConfig` is repeated here so that composing `[...base, ...next]`
 * still ends on the formatting-rule shutdown.
 */
export default [
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/eslint.config.*"],
    rules: {
      // eslint-config-next bundles eslint-plugin-import, whose
      // no-anonymous-default-export warns on `export default [...]` — the
      // canonical flat-config idiom. Switch it off for config files so
      // consumers need no `const config = [...]; export default config;` shim.
      "import/no-anonymous-default-export": "off",
    },
  },
  prettierConfig,
  // Framework-generated artifacts; consumers append their own ignores.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];
