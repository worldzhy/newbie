import core from "./core.js";
import prettierConfig from "eslint-config-prettier";

/**
 * Base standard for the devbie ecosystem.
 *
 * Consumers: newbie (monorepo), newbie-starter, nightwatch-backend,
 * newbie-modules, apits, fewbie-cli (inside newbie). All of them are Node.js
 * TypeScript codebases — no browser DOM framework. The language-level rules
 * live in `core` so base and next standards never drift on the shared part.
 *
 * Repo-specific rules and ignores belong in the consumer's own
 * eslint.config.mjs, spread after this entry.
 */
export default [...core, prettierConfig];
