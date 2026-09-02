---
name: agent-wiki-context-repository-map
description: Orientation for Git Platform Enhancer — what lives where, how to load and verify it, entry points, and the gotchas that bite first.
---

# Repository Map

Read this before touching code. Underlying facts a human would also want are in
[`../../../wiki/information/architecture.md`](../../../wiki/information/architecture.md);
this page carries what an agent needs in order to act correctly.

## What lives where

| Path | Role |
|---|---|
| `manifest.json` | Manifest V3 manifest. Declares two `content_scripts` entries — one for `*://github.com/*`, one for `*://gitlab.com/*` — and the ordered `js` list each injects. **The only place load order exists.** |
| `github/core.js`, `gitlab/core.js` | Per-platform entry point. Parses the URL into a context object, builds the floating menu, exposes the namespace other modules attach to. |
| `github/button/*.js`, `gitlab/button/*.js` | Feature modules. Each is an IIFE that bails unless its context precondition holds, then appends one item to the menu. |
| `github/button/favorite.js`, `gitlab/button/favorite.js` | The favorites system — storage engine, star FAB, manager modal, browser modal. The largest module by a wide margin. |
| `icon.png` | 128px extension icon. |
| `AGENTS.md`, `.agents/` | The agent instruction system. |
| `wiki/` | Human documentation. |

## Entry points

Execution starts at `{platform}/core.js`, which must run before any `button/` module.
`core.js` sets `window.DC_GitHub` or `window.DC_GitLab`, and every button module begins by
checking that namespace and returning if it is absent. There is no other initialization
path and no background or service worker.

## Build, test, run

There is **no build step, no package manager, no dependency tree, and no test framework**.
The repository is loaded directly:

1. Open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, select the
   repository root.
2. After changing any file, press **Reload** on the extension card, then hard-reload the
   GitHub or GitLab tab. Content scripts are injected at document load; an un-reloaded tab
   keeps running the previous copy.

Full procedure, including what to exercise on each platform:
[`../../../wiki/environments/setup.md`](../../../wiki/environments/setup.md).

Verification is manual, on both platforms. There is nothing to run that will tell you a
change is correct.

## Gotchas

These are established from reading the code, not guesses.

* **The two platform trees are near-duplicates.** `core.js` and `favorite.js` differ by
  roughly five percent — namespace, storage key, URL parsing, font, event names — and the
  rest is byte-identical. A fix applied to one is almost always needed in the other. Check
  both before calling a change done.
* **URL parsing differs fundamentally between the hosts.** GitHub is `/{org}/{repo}` with a
  reserved-word list; GitLab is `/{group}/…/{project}` with a `/-/` separator marking the
  end of the project path and its own reserved list. A change to one parser tells you
  nothing about the other.
* **`document_idle` fires once per document load.** Both hosts are single-page
  applications, so the parsed context goes stale as soon as the user clicks an in-app link.
* **The menu is injected into `document.body` at `z-index: 2147483647`.** Modals sit one
  above that. Lowering either lets host UI cover the menu.
* **Storage is per-platform**: `gh_favorites` and `gl_favorites` are separate keys and are
  never merged. Renaming a key orphans real user data — see
  [`../domain/favorites-data-safety.md`](../domain/favorites-data-safety.md).
* **`chrome.storage.local` throws after an extension reload** while an old tab is still
  open. Every read is wrapped so it resolves to an empty list rather than rejecting.

## Known defects

Recorded from a read of the code, for whoever picks this up next:

| Where | Defect |
|---|---|
| `{platform}/button/favorite.js` | `FS.moveItem()` is called by the Move button but is never defined on `FS`. The button throws on every click, on both platforms. |
| `{platform}/button/favorite.js` | Pins are keyed by `id: repoId`, so one repository saved to two folders produces two records with the same `id`; `deleteItem` then removes every copy, plus any item whose `parentId` matches that id. |
| `{platform}/button/favorite.js`, `{platform}/core.js` | Page-derived names are interpolated into `innerHTML`, so a crafted repository path injects markup. |
| `github/core.js` | Injection is gated on `.application-main`, which is absent on newer React-rendered GitHub pages; the menu silently never appears there. |
| `gitlab/core.js` | The project path is taken as the first two path segments, which mis-parses nested subgroups (`group/subgroup/project`). |
| `{platform}/button/favorite.js` | Every `FS` helper re-reads all of storage, and the manager modal's save loop performs a read and a write per folder in sequence. |
