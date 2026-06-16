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

### Print start (skip mesh)
A `PRINT_START` macro that supports a `SKIP_MESH` parameter lets you skip bed mesh leveling on a print you trust the existing mesh for, saving the probing time at the start of every job. Doing this normally means hand-editing the gcode's `PRINT_START` line before each such print. This feature makes that a one-click action from the dashboard without touching the original file.

- Adds a "Print start (skip mesh)" entry to the context menu of each gcode file row in the dashboard Status widget. On click it downloads the gcode, injects `SKIP_MESH=1` into the `PRINT_START` macro invocation line, writes the result to an untouched **sibling** file (`<name>.skipmesh.gcode`), and starts printing that sibling via `/server/files/upload` with `print=true`.
- The menu entry is disabled under the same condition as the existing "Print start" entry (`printerIsPrinting || !klipperReadyForGui`), and surfaces an error toast when the selected file has no `PRINT_START` command.

