import core from "./core.js";
import prettierConfig from "eslint-config-prettier";

/**
 * Baseline standard for the devbie ecosystem.
 *
 * Consumers: every repo composes this and optionally adds a framework layer —
 * `[...base, ...nest]` for Nest applications, `[...base, ...next]` for Next.js
 * applications. Repos without a framework (newbie-modules, a dependency-free
 * source registry) use `base` alone: every rule here is syntactic, so it runs
 * without installing module dependencies.
 *
 * Repo-specific rules and ignores belong in the consumer's own
 * eslint.config.mjs, spread after this entry.
 */
export default [...core, prettierConfig];
