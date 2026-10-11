# Release Checklist

Run through every step below before publishing any package in this repo (packages/core, packages/cli, packages/heartbeat-sdk, packages/health-sdk, packages/web-monitor-sdk, packages/backend-monitor-sdk, packages/aws-secrets-cli). Do not skip steps for "trivial" patches.

1. `git status` — working tree is clean, all intended changes are committed.
2. Clean build: remove `dist/` and `*.tsbuildinfo` for the package(s) being released, then rebuild. Never publish from a stale `dist/`.
3. Run the full test suite for the package(s) being released; all tests pass.
4. Confirm the version bump in `package.json` follows semver relative to the actual change set (feat -> minor, fix -> patch, breaking -> major).
5. Publish with `npm publish --tag latest --otp=<code>`. Never use a `stage` dist-tag or the `npm stage` workflow.
6. After publishing, run `npm view <package> dist-tags` to confirm `latest` points to the new version. Registry propagation can take 1-2 minutes — wait and re-check instead of re-publishing.
7. If packages in this repo depend on each other, publish the dependencies first and the dependents last.
8. Update consuming projects' dependency version and record the change in project memory.
