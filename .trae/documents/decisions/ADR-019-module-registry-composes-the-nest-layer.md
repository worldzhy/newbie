# ADR-019: the module registry composes the nest layer with file-scoped exceptions

Date: 2026-10-21
Status: accepted
Supersedes: ADR-017 (the `newbie-modules` placement: base-only linting for a repo that "installs no dependencies by design")

## Context

ADR-017 kept `newbie-modules` on `base` alone so the type-aware Nest rules would
never run against a repo that installs none of the modules' runtime
dependencies. That placement aged out for two reasons:

1. The nest layer's value is highest exactly where modules are written. Rules
   such as `api-method-should-specify-api-response` and
   `api-property-matches-property-optionality` encode the OpenAPI contract the
   apits pipeline consumes. Enforcing them only at assembly time means the host
   reports errors for code that is already committed to the registry, and every
   host repeats the same review.
2. The first full run over the registry surfaced 394 findings (388 errors, 6
   warnings), the bulk of them in modules that have never been assembled into a
   host. A sandbox experiment also showed the typed rules do run against
   registry sources once a `tsconfig.json` exists; external types that cannot
   resolve here (the host-generated Prisma client, uninstalled SDKs) collapse
   to `any`.

The dependency question was settled by inspection, not taste: every host that
can assemble a module is a Nest application, so the nest layer's toolchain is
present in every real consumption context regardless of what the registry
installs.

## Candidates

1. Keep `base` only (do nothing): the registry stays syntactic, and violations
   surface in the host — a repo that did not author the code.
2. Compose `[...base, ...nest]` in the registry and accept that some property
   types resolve to `any`.

## Decision

- `newbie-modules` composes `[...base, ...nest]`. Decisive reason: the registry
  is the authoring site of every module, so a rule the host will enforce must
  be visible at authoring time — lint parity between registry and host is worth
  more than a purely syntactic registry lint. Module runtime dependencies stay
  uninstalled; only the lint toolchain (eslint, prettier, style-guide) is a
  devDependency.
- A repo-root `tsconfig.json` (noEmit) makes the type-aware rules loadable and
  maps `@modules/*` into the packages tree. `@generated/*` and uninstalled SDK
  types remain unresolved by design.
- Where `any`-resolution would change a rule's verdict, the exception lives in
  the registry's `eslint.config.mjs` as a file-scoped block with the reason
  inline — never as an `eslint-disable` inside module sources. Module sources
  must stay byte-identical to the host's assembled copy (the diff-empty
  back-port rule), and the exceptions belong to the registry's consumption
  situation, not to the module itself.
- The same config re-enables `injectable-should-be-provided` for the six files
  that carry the host's intentional per-class suppressions (useClass token
  bindings, APP_GUARD), so those suppressions stay meaningful in both repos
  instead of being deleted as "unused" while the rule is globally off.

## Cross-host check

The exceptions live only in the registry's own config. A host assembling these
modules inherits zero exceptions: it resolves the real Prisma types and keeps
both rules enabled. No host-specific concept leaks into module sources.

## Consequences

- The 394 findings were fixed in `newbie-modules` commit `4750fcb`; for the
  already-assembled modules the fixed sources are identical to the host copies
  (`diff` empty), so lint parity is now mechanical rather than asserted.
- Seven files carry the `all-properties-have-explicit-defined` exception and six
  files the `injectable-should-be-provided` re-enable. Both lists are deleted
  the day the registry can resolve external types (a type-stub package or a
  generated client) — the follow-up to the layers' dependency-union question.
- The registry's `lint` script must stay scoped to `packages/**/*.ts`:
  `projectService` rejects files that belong to no TypeScript project, such as
  `eslint.config.mjs` and `scripts/*.mjs`.
