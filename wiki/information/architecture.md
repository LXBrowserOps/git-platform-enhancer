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

Order within each array is significant and is expressed nowhere else. The core module must
run first; every feature module depends on the namespace it creates.

## Core and modules

**`{platform}/core.js`** is the entry point. It:

1. Parses `window.location.pathname` into a context object describing the current page —
   the owner, the repository, a suggested local path, and whether the page is a repository
   page or an organization page.
2. Builds the floating menu: a fixed-position wrapper, a circular toggle button, and a
   list container.
3. Exposes a namespace — `window.DC_GitHub` or `window.DC_GitLab` — carrying that context,
   the menu handles, and a `createItem` helper.
4. Dispatches events when the menu opens and closes, so other modules can react.

**`{platform}/button/*.js`** are feature modules. Each is an immediately-invoked function
that checks the namespace exists and that its own precondition holds — usually "we are on
a repository page" — and returns silently if not. When the precondition holds, it builds
one menu item and appends it.

This is what makes the menu context-aware: nothing filters the list, because a module that
does not apply never adds itself.

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
