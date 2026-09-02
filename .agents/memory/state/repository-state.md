---
name: memory-state-repository-state
description: Current known state of Git Platform Enhancer — what exists, what is in flight, and the next obvious step.
---

# Repository State

## 2026-09-02

**Stack.** Manifest V3 browser extension. Plain browser JavaScript, no build step, no
package manager, no dependency tree, no test framework. Version `1.0.0`, recorded in
`manifest.json`. Licensed MIT, copyright 2026 BrowserOps.

**What exists.** Two per-platform content-script trees, `github/` and `gitlab/`, each with
a `core.js` entry point and six `button/` feature modules, injected by two
`content_scripts` entries in `manifest.json`. Roughly 920 lines of JavaScript in total.

**Instruction system.** Adopted this date as a Mode B consumer of the shared instruction
set served by the `lxagents-agents-base` connector. `AGENTS.md`, `.agents/`, and `wiki/`
now exist; no shared file is vendored and there are no overrides.

**Known state of the code.** The two platform trees are near-duplicates — `core.js` and
`favorite.js` differ by roughly five percent, the rest being byte-identical. Six defects
are recorded in `.agents/wiki/context/repository-map.md`, the most serious being an
`FS.moveItem()` call that has no definition on either platform, so the Move button throws
on every click.

**In flight.** A five-task request is underway: this instruction-system adoption, then a
record, then extraction of the duplicated code into a shared runtime with per-platform
adapters, then the defect fixes, then a release at `1.1.0`. The user has approved the plan
and has standing permission to open pull requests and to merge.

**Not yet built.** No shared code layer, no automated tests, no CI, no support for
self-hosted GitHub or GitLab instances, and no export path for favorites data.

**Next obvious step.** Task 2 — write the task record for the shared-runtime work.
