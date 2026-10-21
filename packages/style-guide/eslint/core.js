import tseslint from "typescript-eslint";

/**
 * Language-level baseline shared by every devbie codebase.
 *
 * Formatting rules (quotes, eol-last, trailing spaces, ...) are deliberately
 * absent: prettier owns formatting. Every public entry appends
 * eslint-config-prettier last so no plugin can re-enable eslint formatting
 * rules afterwards.
 *
 * Internal entry: consumers import `backend`, `frontend` or `next`, never
 * this file.
 */
export default [
  ...tseslint.configs.recommended,
  {
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
      "no-restricted-properties": [
        "error",
        { object: "describe", property: "only" },
        { object: "it", property: "only" },
      ],
    },
  },
];
