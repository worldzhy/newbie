# Release Checklist

Run through every step below before publishing any package in this repo (packages/newbie, packages/newbie-cli, packages/heartbeat-sdk, packages/health-sdk, packages/web-monitor-sdk, packages/backend-monitor-sdk, packages/aws-secrets-cli, packages/fewbie-cli, packages/apits, packages/style-guide). Do not skip steps for "trivial" patches.

1. `git status` — working tree is clean, all intended changes are committed.
2. Clean build: remove `dist/` and `*.tsbuildinfo` for the package(s) being released, then rebuild. Never publish from a stale `dist/`.
3. Run the full test suite for the package(s) being released; all tests pass.
4. Run `npm audit --omit=dev --workspaces` from the repo root; production dependencies must be free of known vulnerabilities. Any finding must be fixed or explicitly waived (with the reason recorded) before publishing.
5. Confirm the version bump in `package.json` follows semver relative to the actual change set (feat -> minor, fix -> patch, breaking -> major).
6. Publish with `npm publish --tag latest`. Never use a `stage` dist-tag or the `npm stage` workflow. (OTP is not required; decided 2026-09-29.)
7. After publishing, run `npm view <package> dist-tags` to confirm `latest` points to the new version. Registry propagation can take 1-2 minutes — wait and re-check instead of re-publishing.
8. If packages in this repo depend on each other, publish the dependencies first and the dependents last.
9. Update consuming projects' dependency version and record the change in project memory.
10. If any `@devbie/*` package was published in this release, update the starter template lockfile in the newbie-starter repo (commit to dev), then run `npm run check:template-deps -w @devbie/newbie-cli` from the repo root to confirm no drift remains. The script clones the template's default branch — the same source `newbie create` uses — so it only turns green once the dev changes have been merged into main. For `@devbie/fewbie-cli` releases the same applies to the fewbie-starter repo, verified with `npm run check:template-sync -w @devbie/fewbie-cli -- --check-deps`.

## Waived audit findings (re-verify on every release)

- `@devbie/style-guide` — 5 high findings in the `eslint-config-next` tree
  (`fast-glob` / `braces` / `micromatch` glob stack-exhaustion DoS, reached via
  `@next/eslint-plugin-next`). The advisories declare range `*` — no fixed
  upstream versions exist, so no override can resolve them, and npm's suggested
  fix (downgrade `eslint-config-next` to 14) would break Next.js 16 consumers.
  Exposure is lint-time only: nothing runs these libraries against
  attacker-controlled globs. Waived since 1.4.0; revisit when upstream ships
  fixes or the dependency-union milestone reshapes the next layer.
