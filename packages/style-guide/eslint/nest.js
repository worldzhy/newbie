import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

/**
 * Shared eslint flat config for Nest/Node TypeScript codebases
 * (nightwatch-backend, newbie-starter, the newbie/fewbie framework repos).
 *
 * Formatting rules (quotes, eol-last, trailing spaces, ...) are deliberately
 * absent: prettier owns formatting, and eslint-config-prettier disables the
 * eslint side. Prettier violations are enforced by `npm run format:check`.
 */
export default tseslint.config(...tseslint.configs.recommended, prettierConfig, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
    ],

    // Code-quality rules carried over from the legacy gts-derived config.
    "block-scoped-var": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-restricted-properties": ["error", { object: "describe", property: "only" }, { object: "it", property: "only" }],
  },
});
