---
setup: npm ci
rebase:
  continue_check: npm run build && npm run test:unit
---

This is a fork of [mainsail-crew/mainsail](https://github.com/mainsail-crew/mainsail) (tracked as the `upstream` remote, branch `develop`). When writing new features you should endeavor to alter upstream-owned files as little as possible, to minimize future rebase conflict. Prefer adding fork-local modules under `src/extensions/` (with tests under `tests/extensions/`) and wiring them into upstream components with the smallest possible diff.

You can determine which files are unique to the fork (and thus free to edit), by invoking `forklift files --main-branch develop` from bash.

When making changes, you **MUST** update this file to reflect anything new, updated, or removed.

## Auto-fixing lints

- `npm run lint:fix` fixes most ESLint issues automatically.
- `npm run format` rewrites files with Prettier.
- `npm run test:unit` runs the Vitest suite (the fork's tests live in `tests/extensions/`).

## Fork feature set

This fork adds the following on top of upstream:
