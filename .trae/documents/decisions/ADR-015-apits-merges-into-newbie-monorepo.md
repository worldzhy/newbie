# ADR-015: apits merges into the newbie monorepo

Date: 2026-10-21
状态：已采纳

## Context

After ADR-012 absorbed fewbie-cli, `apits` remained the last standalone
`@devbie/*` tool repository — a single-package publishable CLI with its own
CI and release checklist, the same class of artifact as the packages already
living under `packages/*`. Keeping it separate preserved a cross-repository
integration point (fewbie-cli scaffolds projects that consume the generator)
for no architectural benefit.

## Decision

- The apits repository history is merged into `packages/apits` via an
  index-rewriting filter-branch extraction (every path moved under
  `packages/apits/`, all 6 commits preserved), landed as a merge commit with
  `--allow-unrelated-histories`.
- Monorepo normalization, mirroring the fewbie-cli precedent: repository-local
  dotfiles, lockfile, `.github/`, `.trae/`, and `eslint.config.mjs` are dropped
  (the monorepo root governs format/lint/CI); the package keeps `src/`,
  `test/`, `bin/`, `types/`, `README.md`, `DEV.md`, `CHANGELOG.md`, and its
  `father` build.
- The stale `release` script (standard-version + push to a `master` branch
  that no longer exists) and the dead `lint-staged` block are removed;
  `@devbie/style-guide`/`eslint` devDependencies and the `prettier` key move
  to the root, matching every other package in the monorepo.
- CI gains `build` + `test` steps for `@devbie/apits`. The standalone repo's
  CI never ran tests, which let a red test survive: P-4's regexes pinned the
  pre-migration prettier style (single quotes, no spaces) and went red when
  the repo adopted `@devbie/style-guide` (double quotes). The regexes are
  relaxed to be format-agnostic; the assertion intent is unchanged.
- The package gains a `repository` field pointing at `worldzhy/newbie` and is
  published as `@devbie/apits@1.0.4` (metadata-only patch).
- The standalone apits repository is archived read-only on GitHub after its
  `main` carries the archive banner (user-operated, same flow as fewbie).

## Consequences

- The framework surface is now two repositories: `newbie` (all publishable
  tooling) and `newbie-modules` (the source-copy registry, a different
  distribution model that correctly stays separate).
- npm consumers (`nightwatch-frontend`'s `apits gen`) are unaffected: package
  name, bin, and version line continue unchanged.
- The unscoped `apits-gen` line (1.0.0/1.0.1, same-day predecessor of the
  scoped package) is still referenced by fewbie-cli's scaffold templates.
  Retiring that pointer is tracked as a separate decision and is not part of
  this merge.

## Addendum (2026-10-22)

The standalone `apits` repository is no longer publicly reachable: the GitHub
API returns 404 for `worldzhy/apits` and the name is absent from the account's
public repository list, while the archived `fewbie` repository is still listed.
The "archived read-only" step in the Decision therefore did not take effect as
written. Whether the repository was deleted or made private is a GitHub-side
action owned by the maintainer; this addendum records the observed state only
and does not change the merge decision.

## Addendum (2026-10-23)

The maintainer confirmed that the standalone `worldzhy/apits` repository has
been deleted from GitHub. The source of truth for the apits package is now
`packages/apits` in this monorepo, published as `@devbie/apits`. The legacy
unscoped `apits-gen` line on npm remains available for existing consumers but
is no longer the canonical artifact.
