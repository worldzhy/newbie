# ADR-018: Repository renamed to devbie and package directories aligned with package names

Date: 2026-10-21
状态：已采纳

## Context

Every published package in this monorepo is scoped `@devbie/*`, and ADR-012
(fewbie-cli) plus ADR-015 (apits) turned the repository into the home of all
publishable `@devbie` artifacts: `@devbie/newbie`, `@devbie/newbie-cli`,
`@devbie/fewbie-cli`, `@devbie/apits`, `@devbie/style-guide`, the four SDKs and
`@devbie/aws-secrets-cli`. Two naming inconsistencies follow from that history:

- The repository is still called `newbie`, which now names one package out of
  ten. A reader of `worldzhy/newbie` cannot tell that it also ships the frontend
  CLI, the API generator and the style guide.
- Eight of the ten package directories are named after their package
  (`apits/` → `@devbie/apits`, `style-guide/` → `@devbie/style-guide`); the two
  exceptions are `packages/core` and `packages/cli`. `core` is a leftover from
  ADR-004, which dropped the `-core` suffix from the package name but left the
  directory behind, and the name itself is ambiguous — the directory holds the
  framework runtime, not "the core of the monorepo". `cli` became ambiguous once
  `packages/fewbie-cli` landed next to it: one CLI carries its framework prefix,
  the other does not.

## Decision

1. The GitHub repository is renamed `worldzhy/newbie` → `worldzhy/devbie`, so
   the repository name matches the npm scope it publishes. GitHub redirects the
   old URLs, so existing links keep working.
2. `packages/core` → `packages/newbie` and `packages/cli` → `packages/newbie-cli`.
   The directory name is now the package name minus the scope prefix, without
   exceptions.
3. The root workspace package is renamed `newbie-monorepo` → `devbie-monorepo`.
4. Product naming is untouched: the framework stays `newbie`, the npm packages
   and their versions stay identical, the `newbie` bin stays, and the registry
   (`newbie-modules`) and template repositories (`newbie-starter`,
   `fewbie-starter`) stay where they are.

## Consequences

- npm consumers observe no change: no package name, bin or version changes with
  this ADR. The `repository` field of every published package points at
  `worldzhy/devbie` as of its next release.
- The sibling repositories are intentionally outside this repository: they are
  a different artifact class (source-copy registry, template source of truth),
  as recorded in ADR-015. The root README states the artifact taxonomy so the
  repository name is not read as an umbrella for them.
- Paths recorded in earlier ADRs (ADR-017 refers to `packages/core`) are
  historical statements and are not rewritten; ADR-017's decision is unaffected
  and its eslint scope now applies to `packages/newbie`.
- Local checkouts and Trae project memory are keyed by absolute path; the
  working copy moves from `~/src/newbie` to `~/src/devbie`.
