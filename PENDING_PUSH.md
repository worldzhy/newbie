# Pending Push

Commits on `dev` that are committed locally but not yet pushed to the remote (agent pushes directly after committing; see project conventions in trae-knowledge).

Agents: push immediately after a local commit (`git push origin dev`). Only add a row here if a push is deliberately deferred (e.g. mid-investigation, or the user asked to hold off); remove the row once `git log origin/dev..dev` no longer shows that commit.

| Date | Commit(s) | Summary | Notes |
|------|-----------|---------|-------|
