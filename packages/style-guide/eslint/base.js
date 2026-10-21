import core from "./core.js";
import prettierConfig from "eslint-config-prettier";

/**
 * Backend standard for the devbie ecosystem.
 *
 * Consumers: newbie, newbie-starter, nightwatch-backend, newbie-modules,
 * apits. All of them are Nest/Node TypeScript codebases; the language-level
 * rules live in `core` so the backend and frontend standards never drift on
 * the shared part.
 *
 * Repo-specific rules and ignores belong in the consumer's own
 * eslint.config.mjs, spread after this entry.
 */
export default [...core, prettierConfig];
