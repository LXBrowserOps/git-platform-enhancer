---
name: memory-tasks-shared-platform-core
description: Record of the shared-runtime extraction for Git Platform Enhancer — the confirmed task list, decisions, and per-task outcomes.
status: done
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
| 1 | Adopt the shared agent instruction set | Instruction system, both wiki trees, seed memory, 1.0.0 log | `docs/agents-setup` | `AGENTS.md`, `.agents/`, `wiki/`, `README.md` | #2 |
| 2 | Write the task record | This file, before any code moves | `chore/shared-platform-core-plan` | `.agents/memory/`, `.agents/index/` | #3 |
| 3 | Extract the shared runtime | Behaviour-preserving move into `shared/` with per-platform adapters | `refactor/shared-platform-core` | `shared/`, `github/`, `gitlab/`, `manifest.json`, docs | #4 |
| 4 | Fix the recorded defects | The six recorded defects plus the storage-churn issue | `fix/favorites-and-context` | `shared/`, adapters, docs | #5 |
| 5 | Release 1.1.0 | Version bump, changelog, index rows, close this record | `chore/release` | `manifest.json`, `wiki/logs/`, `.agents/` | #6 |

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

## Task 4 — `fix/favorites-and-context`

**Landed.** All seven recorded defects, fixed once in the shared runtime:

1. `FS.moveItem` now exists; the Move button previously threw on every click. Moving a pin
   onto a folder that already holds the repository merges instead of duplicating.
2. Pins are addressed by `(id, type, parentId)`. Deleting one copy no longer removes the
   same repository from every other folder, and folder deletion now cascades to any depth
   instead of leaving orphaned records.
3. Page-derived names are added as text nodes. The previous `innerHTML` interpolation was
   a live injection vector.
4. `shared/bootstrap.js` rebuilds the menu on every URL change, so the context no longer
   goes stale on in-app navigation, with each mount's listeners detached via `AbortSignal`
   and a guard against double injection.
5. GitHub injection is gated on `document.body`; the old `.application-main` gate hid the
   menu entirely on newer React-rendered pages.
6. GitLab resolves the project path as everything before `/-/`, so a project in nested
   subgroups is no longer truncated to its subgroup.
7. `setPinFolders` reconciles folder membership in one read and one write; the browser
   modal takes one snapshot instead of three reads.

Also: `browser.storage.local` is preferred where present, so the storage layer works under
Firefox as well as Chromium.

**Verified.** A defect harness runs each of the seven against the task 3 code and against
this one, in Chromium: 0/7 passing before, 7/7 after. The injection case was live — the
crafted name executed an injected `<img onerror>` before the fix and produces no element
after it. The render-parity harness from task 3 was re-run against the original
pre-refactor code: 18 of 20 snapshots unchanged, the two differences being exactly the
intended injection fix, and a layout measurement confirmed the removed whitespace node
changes no pixel.

**Established for later tasks.** Nothing further is outstanding. The defect table in
`.agents/wiki/context/repository-map.md` became a "behaviour to preserve" table.

**Left open.** Storage keys and the record schema are untouched, so no migration is
needed and existing favorites are unaffected.

## Task 5 — `chore/release`

**Landed.** Version raised to 1.1.0 in `manifest.json` with the user's explicit approval,
the `1.1.0` release log added and indexed, and the repository state memory refreshed to
its post-release shape. The `PR` column above is filled and this record is closed.

**Verified.** All five pull requests were re-targeted onto `master` before merging rather
than after, so each landed on the default branch instead of into the branch below it.

**Note for the next session.** The forge appended a generated-by footer carrying a session
URL to four of the five pull request bodies *after* they were posted. The bodies sent were
clean; the stored ones were not. They were read back, the footer stripped, and the strip
confirmed by re-reading — before any merge. Checking a posted artifact after posting is
not optional here, because this integration does it every time.

**Left open.** The repository still has no automated tests and no CI, so nothing in the
tree will catch a regression in the shared runtime. The verification behind tasks 3 and 4
ran from harnesses outside the repository, driving Chromium through Playwright. Adding a
minimal harness in-repo is the obvious next piece of work.
