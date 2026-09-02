---
name: memory-tasks-shared-platform-core
description: Record of the shared-runtime extraction for Git Platform Enhancer — the confirmed task list, decisions, and per-task outcomes.
status: in-progress
---

# Task — Shared Platform Core

**Goal.** The `github/` and `gitlab/` trees are near-duplicates: `core.js` and
`favorite.js` differ by roughly five percent and the rest is byte-identical. Every fix has
to be written twice, and in practice one copy drifts. Collapse the duplication into one
runtime with a thin per-platform adapter, then fix the defects once instead of twice.

**Objective.** A single `shared/` runtime plus one adapter per platform, wired through
`manifest.json`, with the six defects recorded in
[`../../wiki/context/repository-map.md`](../../wiki/context/repository-map.md) fixed and a
seventh performance issue addressed — and **no change to stored user favorites**, which is
the constraint that makes the whole refactor safe or not.

**Detail and boundaries.**

* The storage keys `gh_favorites` and `gl_favorites` and the record schema in
  [`../../../wiki/reference/favorites-storage.md`](../../../wiki/reference/favorites-storage.md)
  do not change. Existing user data must survive the upgrade untouched.
* No build step, bundler, or dependency may be introduced. The repository stays loadable
  with "Load unpacked".
* No new manifest permission. `storage` remains the only one.
* The visual result is unchanged — this is a structural refactor, not a redesign.
* Self-hosted GitHub and GitLab instances remain out of scope.

## Tasks

| # | Title | Scope | Branch | Files / areas | PR |
|---|---|---|---|---|---|
| 1 | Adopt the shared agent instruction set | Instruction system, both wiki trees, seed memory, 1.0.0 log | `docs/agents-setup` | `AGENTS.md`, `.agents/`, `wiki/`, `README.md` | |
| 2 | Write the task record | This file, before any code moves | `chore/shared-platform-core-plan` | `.agents/memory/`, `.agents/index/` | |
| 3 | Extract the shared runtime | Behaviour-preserving move into `shared/` with per-platform adapters | `refactor/shared-platform-core` | `shared/`, `github/`, `gitlab/`, `manifest.json`, docs | |
| 4 | Fix the recorded defects | The six recorded defects plus the storage-churn issue | `fix/favorites-and-context` | `shared/`, adapters, docs | |
| 5 | Release 1.1.0 | Version bump, changelog, index rows, close this record | `chore/release` | `manifest.json`, `wiki/logs/`, `.agents/` | |

Branches stack in order: task 1 from `master`, task `k` from task `k-1`.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Share or keep separate | Extract to `shared/` with per-platform adapters | The duplication is near-total and already causing divergence; the parts that genuinely differ are small and enumerable. |
| Adapter boundary | URL parsing, storage key, host URLs, font, event names | These are exactly the differences the diff between the two trees exposes — nothing else varies. |
| Load order | Adapter first, shared modules, bootstrap last | `manifest.json` is the only place load order exists, and the bootstrap needs the adapter defined before it runs. |
| Storage keys | Unchanged | Renaming a key orphans real user data with no recovery path. |
| Refactor and fixes split | Two tasks, two branches | Task 3's diff must be reviewable as behaviour-neutral; mixing fixes in makes that impossible to verify. |
| Version | `1.1.0`, minor | Approved by the user. Additive behaviour — SPA navigation and a Move action that never worked — beyond pure fixes. |

## Task 2 — `chore/shared-platform-core-plan`

**Landed.** This record, with the confirmed five-task list and the decisions behind it,
written before any code moves. Registered in `.agents/index/memory-index.md`, and
cross-linked from the setup record so either entry point reaches the other.

**Established for later tasks.** The task table above is the contract tasks 3 to 5 execute
against; the `PR` column stays empty until every branch is pushed and is filled by the
release task. The boundaries section is the list of things those tasks may not change.

## Task 3 — `refactor/shared-platform-core`

**Landed.** The duplicated platform trees collapsed into one runtime under `shared/`
(`ui`, `storage`, `core`, `buttons`, `favorites`, `bootstrap`) plus one adapter per
platform at `{platform}/platform.js`. `manifest.json` rewired to load adapter first,
shared modules next, bootstrap last. The fourteen old files under `github/` and `gitlab/`
were removed. The namespace moved from `window.DC_GitHub` / `window.DC_GitLab` to a single
`window.DC`; it is internal to the extension and invisible to the host page.

**Verified.** Two harnesses, both run against the pre-refactor code from git history:

* Context-parsing parity over 34 real URL shapes across both platforms — root, project,
  nested project, file views, sub-pages, owner pages, and every reserved path — all
  identical.
* Rendered-DOM parity in Chromium over four page contexts on both platforms, comparing the
  menu at rest, the menu open, the favorites list open, the browser modal, and the
  resulting storage contents. Twenty snapshots, all identical after style declarations
  were normalised for assignment order.

The render harness caught one genuine regression during the work — a `z-index` added to
the main toggle button that the original did not carry — which was fixed before commit.

**Established for later tasks.** The seven defects are unchanged and now live at
`shared/favorites.js`, `shared/storage.js`, `shared/ui.js`, and the two adapters; the paths
in `.agents/wiki/context/repository-map.md` were updated to match. Task 4 fixes them in one
place instead of two.

**Left open.** Nothing from this task. The adapter contract page deferred from task 1 was
written here, in the same commit as the code that establishes it.
