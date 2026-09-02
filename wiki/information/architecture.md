# Architecture

The extension is a set of content scripts injected into GitHub and GitLab pages. There is
no background page, no service worker, no build step, and no dependency tree. What the
repository contains is exactly what the browser runs.

## Injection model

`manifest.json` declares two `content_scripts` entries — one matching `*://github.com/*`
and one matching `*://gitlab.com/*` — each listing an ordered array of scripts injected at
`document_idle`.

The two entries are separate sandboxes in the sense that matters here: a page is only ever
one of the two, so only one platform's scripts run on any given page.

Order within each array is significant and is expressed nowhere else: the adapter loads
first, the shared modules next, and `shared/bootstrap.js` last.

## One runtime, two adapters

The behaviour of the extension is identical on both platforms, so it is written once, in
`shared/`. Everything that genuinely differs between GitHub and GitLab — URL parsing, the
storage key, host URLs, fonts, event names — lives in a per-platform **adapter** at
`{platform}/platform.js`.

| Module | Role |
|---|---|
| `{platform}/platform.js` | The adapter. Assigns `window.DC.platform`. |
| `shared/ui.js` | Visual language and DOM helpers. |
| `shared/storage.js` | The favorites storage engine. |
| `shared/core.js` | Builds the floating menu. |
| `shared/buttons.js` | The simple menu items. |
| `shared/favorites.js` | Star button, manager modal, browser modal. |
| `shared/bootstrap.js` | Entry point: reads the adapter, parses context, assembles everything. |

`shared/bootstrap.js` asks the adapter whether the extension should run at all, then hands
`window.location.pathname` to `parseContext` and gets back a context object describing the
page — the owner, the project, a suggested local path, and whether this is a repository or
an organization page.

Each feature then checks its own precondition against that context and adds nothing when it
does not hold. This is what makes the menu context-aware: nothing filters the list, because
a feature that does not apply never adds itself.

The adapter interface is documented in
[`../reference/platform-adapter.md`](../reference/platform-adapter.md). No shared module
branches on which platform it is running on; when shared behaviour needs to differ, that
difference becomes a new adapter field.

## Context detection

The two platforms structure URLs differently, so each has its own parser.

**GitHub** treats `/{owner}/{repo}` as a repository. A reserved-word list excludes paths
such as `/settings` and `/marketplace` that share the shape but are not repositories. A
third path segment usually means a sub-page rather than the repository root, except for
`tree` and `blob`.

**GitLab** allows nested groups, so a project path is not a fixed number of segments. The
`/-/` separator marks the end of the project path and the start of a sub-page, and a
reserved-word list excludes `/dashboard`, `/explore` and similar.

Because the two parsers share no logic, a change to one says nothing about the other.

## Styling

All styling is inline, applied with `Object.assign(element.style, { … })`. There is no
stylesheet. A content script shares the DOM with a host page that has its own CSS, so
every visual property is set explicitly rather than inherited, and the menu sits at a very
high `z-index` so host UI cannot cover it.

The visual language is a translucent "glassmorphism" treatment — a white-silver background
at partial opacity over a backdrop blur.

## Storage

The favorites system is the only stateful part of the extension. It uses
`chrome.storage.local` under one key per platform, holding a flat array of records that
encodes a folder tree by parent reference. The schema is documented in
[`../reference/favorites-storage.md`](../reference/favorites-storage.md).
