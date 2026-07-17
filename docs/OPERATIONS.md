# Operations

Operational notes for maintaining AURELEAN Main without assuming live service access.

<!-- portfolio-maintenance-20260717:operations:start -->
## Routine Validation

- `dev` is declared in the root package scripts.
- `start` is declared in the root package scripts.
- `build` is declared in the root package scripts.
- `lint` is declared in the root package scripts.
- `test:smoke` is declared in the root package scripts.

For documentation-only changes, always run `git diff --check`, validate relative Markdown links, and scan the changed tree for secrets. Runtime tests require the repository dependencies and should not be installed solely for a documentation edit when storage is constrained.

## Controlled Commands

No deployment, release, migration, billing, or production script names were detected at the root.

## Data and Secrets

- Treat local environment files, credentials, customer data, supplier data, and generated browser profiles as non-source artifacts.
- Keep reproducible outputs such as `node_modules/`, `.next/`, `dist/`, build caches, and virtual environments out of preservation commits unless a repository explicitly tracks a release artifact.
- Back up source and evidence before removing duplicate worktrees.

## Recovery

The baseline for this documentation branch is `b71876271170597deda65cf7e0d0274cc8bc8a5d` on `main`. Restore runtime state from Git history and repository-managed migrations or seed procedures; do not treat local caches as backups.
<!-- portfolio-maintenance-20260717:operations:end -->
