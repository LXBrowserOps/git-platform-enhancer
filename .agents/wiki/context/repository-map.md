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
| `github/platform.js`, `gitlab/platform.js` | Per-platform **adapter** — URL parsing, storage key, host URLs, fonts, event names. Everything that differs between the two platforms, and nothing else. |
| `shared/bootstrap.js` | Entry point. Reads the adapter, builds the menu, attaches the feature modules. Loads last. |
| `shared/core.js` | Builds the floating menu: wrapper, toggle button, and the list features attach to. |
| `shared/buttons.js` | The simple menu items — Home, owner, Create Repository, Dev Container, Auto Clone Local. |
| `shared/favorites.js` | The favorites system — star FAB, manager modal, browser modal. The largest module by a wide margin. |
| `shared/storage.js` | The favorites storage engine over `chrome.storage.local`. |
| `shared/ui.js` | Shared visual language and DOM helpers. |
| `icon.png` | 128px extension icon. |
| `AGENTS.md`, `.agents/` | The agent instruction system. |
| `wiki/` | Human documentation. |

## Entry points

Execution starts at `{platform}/platform.js`, which assigns the adapter to
`window.DC.platform`. The shared modules then register themselves on `window.DC`, and
`shared/bootstrap.js` — listed last in `manifest.json` — reads the adapter, parses the page
context, and builds everything. There is no other initialization path and no background or
service worker.

The adapter interface is documented in
[`../../../wiki/reference/platform-adapter.md`](../../../wiki/reference/platform-adapter.md);
the procedure for changing one is
[`../sop/add-platform-adapter.md`](../sop/add-platform-adapter.md).

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

* **`shared/` runs on both platforms.** A change there affects GitHub and GitLab at once,
  so it must be verified on both. Nothing in `shared/` may branch on platform identity —
  that difference belongs in the adapter.
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

## Behaviour to preserve

These were defects, fixed and covered by the verification described in
`.agents/memory/tasks/shared-platform-core.md`. Re-introducing any of them is a
regression, not a new bug.

| Area | What must hold |
|---|---|
| `shared/storage.js` | A pin is identified by `(id, type, parentId)`, never by `id` alone — the same repository may be pinned into several folders. Deleting one copy leaves the others. |
| `shared/storage.js` | Deleting a folder removes everything beneath it to any depth, so no record is orphaned. |
| `shared/storage.js` | `setPinFolders` reconciles membership in one read and one write. Do not reintroduce a per-folder loop. |
| `shared/ui.js`, `shared/favorites.js` | Page-derived text is added with `textContent` or a text node, never by interpolating into `innerHTML`. Repository and group names come from the URL. |
| `shared/bootstrap.js` | The menu is rebuilt on every URL change, and each mount's listeners are detached through its `AbortSignal`. Exactly one wrapper exists at a time. |
| `github/platform.js` | Injection is gated on `document.body`, not on a host-specific container that newer pages no longer render. |
| `gitlab/platform.js` | The project path is everything before the `/-/` separator, so a project inside nested subgroups resolves in full. |
