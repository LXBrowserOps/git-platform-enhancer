---
name: memory-state-repository-state
description: Current known state of Git Platform Enhancer — what exists, what is in flight, and the next obvious step.
---

# Repository State

## 2026-09-02

**Stack.** Manifest V3 browser extension. Plain browser JavaScript, no build step, no
package manager, no dependency tree, no test framework. Version `1.1.0`, recorded in
`manifest.json`. Licensed MIT, copyright 2026 BrowserOps.

**What exists.** One runtime under `shared/` used by both platforms, plus one adapter each
at `github/platform.js` and `gitlab/platform.js` holding only what differs. Two
`content_scripts` entries in `manifest.json` load the adapter, the shared modules, and
`shared/bootstrap.js`, in that order.

**Instruction system.** Adopted this date as a Mode B consumer of the shared instruction
set served by the `lxagents-agents-base` connector. `AGENTS.md`, `.agents/`, and `wiki/`
now exist; no shared file is vendored and there are no overrides.

**Known state of the code.** The duplication is gone and all seven recorded defects are
fixed, including a live injection vector in the favorites UI. What must not regress is
listed as "behaviour to preserve" in `.agents/wiki/context/repository-map.md`.

**In flight.** The five-task request is complete through the release task; branches are
stacked and awaiting pull requests and merge, for which the user has given standing
permission.

**Not yet built.** No automated tests in the repository and no CI — the verification for
this work was run from harnesses outside it, driving Chromium through Playwright. No
support for self-hosted GitHub or GitLab instances, and no export path for favorites data.

**Next obvious step.** Open the five pull requests, merge them in order, and confirm the
default branch matches the top of the stack.
