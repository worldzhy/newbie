# ADR-017: third eslint layer `nest`, and per-package differentiation via path scoping

Date: 2026-10-21
Status: accepted

## Context

ADR-016 settled on two entries (`base`, `next`) and rejected a `nest` entry
because it would have contained no Nest-specific rules. That objection is now
resolved by a real rule source: `@darraghor/eslint-plugin-nestjs-typed` ships
a recommended flat config with Nest-specific rules, four of which are
type-aware. A separate entrance is also the only correct home for those rules:
type-aware linting needs a TypeScript project, while `base` must stay purely
syntactic so that `newbie-modules` (no dependencies installed by design) can
still lint.

The consumer set is heterogeneous per repository:

- `newbie-starter`, `nightwatch-backend`: entirely Nest application code.
- `fewbie-starter`, `nightwatch-frontend`: entirely Next.js.
- `newbie-modules`: no dependencies, source registry only.
- `newbie` monorepo: `packages/core` is a Nest framework, while
  `packages/cli`, `packages/fewbie-cli`, `packages/apits` and the SDK packages
  are plain Node.

## Known non-mechanisms

Two ways of letting each package choose its own entry were evaluated and
rejected on mechanism grounds, not on taste:

1. **An entry field in each package's `package.json` does not exist.** ESLint 9
   flat config reads only `eslint.config.*`; `package.json#eslintConfig` is
   legacy eslintrc and is ignored in flat mode. The `prettier` key works only
   because prettier's own `resolveConfig` reads `package.json`, which does not
   generalize to ESLint.
2. **Nested `eslint.config.*` files do not cascade.** Flat config resolves a
   single config from the working directory upward; a nested config replaces
   rather than extends. Running `eslint` from the repo root (as CI does) would
   ignore it entirely, so root lint and workspace lint would disagree.

## Decision

- `nest` and `next` are **layers**, not standalone standards. Consumers compose
  `[...base, ...nest]` or `[...base, ...next]`; `base` remains usable alone.
  `next` is reshaped to match this model (it previously bundled `core`).
- Per-package differentiation inside one repository is expressed in that
  repository's single root config with `files` scoping. The newbie monorepo
  applies the Nest layer only to `packages/core/src/**/*.ts`; its CLI,
  generator and SDK packages are linted by `base` alone.
- The Nest layer enables the plugin's recommended set with
  `parserOptions.projectService`, so covered files must belong to a TypeScript
  project. Test files are deliberately outside the layer's scope: they are not
  Nest production code, and `base` already lints them syntactically.
- `injectable-should-be-provided` resolves its `src` option relative to the
  lint working directory, so the monorepo root config points it at
  `packages/core/src/**/*.ts`; the other consumers keep the plugin default.
- Released as `@devbie/style-guide@1.3.0`.

## Triage of the first run

Adopting the layer surfaced three findings in `packages/core`:

- `ValidationPipe` did not set `forbidUnknownValues`. Fixed by setting it to
  `true` (CVE-2019-18413); this matches the class-validator 0.14 default and
  makes the intent explicit.
- `AllowAnyOriginRegistry` and `PrismaService` are registered through dynamic
  module metadata (`forRoot()`), which the rule does not traverse. Both get a
  single inline disable naming the reason. No rule is disabled globally.

## Consequences

- Names now describe content in all three cases: `base` has no framework
  rules, `nest` has Nest rules, `next` has Next.js rules.
- A future framework (e.g. a non-Next React host) is added as another layer
  composed on top of `base`; a framework name is never used for an entry that
  carries no framework-specific content.
- Type-aware linting is confined to the two Nest application repos plus
  `packages/core`, so its cost is paid only where it can find something.
