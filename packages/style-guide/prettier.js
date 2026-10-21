/**
 * Canonical prettier config for the devbie ecosystem.
 * Consumers reference it via `"prettier": "@devbie/style-guide/prettier"`
 * in their package.json instead of keeping a local .prettierrc copy.
 *
 * @type {import("prettier").Config}
 */
export default {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  singleAttributePerLine: false,
  objectWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  proseWrap: "preserve",
  insertPragma: false,
  requirePragma: false,
  experimentalTernaries: false,
};
