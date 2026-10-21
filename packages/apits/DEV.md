
## Releasing / publishing

This project uses [`standard-version`](https://github.com/conventional-changelog/standard-version)
for automated versioning, changelog generation, and git tagging.

### One-step release

```bash
npm run release
```

This runs `build` → `standard-version` (bumps version, updates CHANGELOG, creates a git tag) →
`git push --follow-tags` → `npm publish`.

### Manual step-by-step

If you prefer to review each stage before publishing:

```bash
# 1. Build the dist/ output
npm run build

# 2. Bump version + generate changelog + create tag
npx standard-version

# 3. Review the changelog and commit, then push code and tags
git push --follow-tags origin master

# 4. Publish to npm
npm publish
```

### Prerelease (alpha / beta / canary)

```bash
# Standard-version infers the prerelease type from the last tag.
# To publish an alpha:
npx standard-version --prerelease alpha
git push --follow-tags origin master
npm publish --tag alpha
```

### Pre-publish checklist

- All changes are committed and the working tree is clean (`git status`).
- `npm run build` succeeds and `dist/` is up to date.
- `npm test` passes.
- You are logged in to npm (`npm whoami`) with publish access to the package.

## Tips

1. If you have code formatting requirements, you should ignore the generated code in /api in your configuration
