import core from "./core.js";
import prettierConfig from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * Frontend standard for the devbie ecosystem.
 *
 * Consumers: fewbie, fewbie-starter, nightwatch-frontend.
 *
 * Deliberately independent of `eslint-config-next`: that package requires the
 * `next` package to be installed (its parser is `next/dist/compiled/babel
 * /eslint-parser`), while fewbie ships a Node CLI and has no Next runtime.
 * Next.js applications layer `@devbie/style-guide/eslint/next` on top instead.
 *
 * The JSX/React layer is scoped to JSX/TSX files, so Node code in a frontend
 * group repo (fewbie-cli) is never evaluated against React rules, while its
 * React template sources are.
 */
const jsxFiles = ["**/*.jsx", "**/*.tsx"];
const jsxOnly = (config) => ({ ...config, files: jsxFiles });

export default [
  ...core,
  jsxOnly(react.configs.flat.recommended),
  jsxOnly(react.configs.flat["jsx-runtime"]),
  jsxOnly(reactHooks.configs.flat["recommended-latest"]),
  jsxOnly(jsxA11y.flatConfigs.recommended),
  // Pinned instead of `detect`: fewbie lints React 19 template sources without
  // a `react` package installed, where detection only produces a warning.
  { settings: { react: { version: "19.0" } } },
  prettierConfig,
];
