import nestjsTyped from "@darraghor/eslint-plugin-nestjs-typed";
import prettierConfig from "eslint-config-prettier";

/**
 * Nest.js layer for the devbie ecosystem.
 *
 * This is a layer, not a standalone standard: compose it after `base`
 * (`export default [...base, ...nest]`). Keeping it separable lets a
 * monorepo scope the Nest rules to the packages that actually contain Nest
 * code, instead of applying a framework standard to its plain Node packages.
 *
 * The rule set is the plugin's recommended flat config. Four of those rules
 * are type-aware, so every file covered by this layer must belong to a
 * TypeScript project (projectService resolves the nearest tsconfig.json). The
 * plugin's own peer declarations bring what its rules expect (`class-validator`
 * is referenced by name only — the rules never import it at lint runtime), and
 * npm/pnpm auto-install those peers, so no extra install step is required.
 *
 * `prettierConfig` is repeated here so that composing `[...base, ...nest]`
 * still ends on the formatting-rule shutdown.
 */
export default [
  ...nestjsTyped.configs.flatRecommended,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
  },
  prettierConfig,
];
