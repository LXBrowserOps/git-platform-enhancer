---
name: browser-extension-rules
description: Manifest V3 and content-script constraints every code change in this extension must satisfy.
---

# Browser Extension Rules

These constraints come from the Manifest V3 platform, not from taste. A change that
violates one does not fail loudly — it fails in a specific browser, on a specific page,
usually silently.

## Manifest V3

* **The manifest is the only registry.** A script exists to the browser only when it is
  listed in `content_scripts[].js`. Adding, renaming, or moving a script means editing
  `manifest.json` in the same commit.
* **Order within a `js` array is the execution order.** A module that reads a namespace
  another module defines must be listed after it.
* **`matches` patterns are the security boundary.** Widening one grants the extension
  access to more of the web. Never broaden a match pattern to work around a context-
  detection bug — fix the detection.
* **Request the narrowest permission set that works.** The extension currently holds
  `storage` alone. Any addition needs an explicit user decision and a stated reason.
* **No remotely hosted code.** Manifest V3 forbids it outright; stores reject it on review.

## Content scripts

* **The isolated world is not the page.** A content script cannot see the host page's
  JavaScript variables, and the page cannot see the extension's. Do not attempt to reach
  the page's own framework state.
* **`window` is shared between this extension's own content scripts** in the same frame,
  which is what makes a namespace on `window` a valid channel between modules — and what
  makes a name collision with another script in the same array a real risk.
* **`document_idle` fires once.** It does not fire again on client-side navigation. Both
  GitHub and GitLab are single-page applications, so any module assuming a fresh document
  per URL is wrong after the first in-app link click.
* **Guard against double injection.** A script can run more than once in a frame. Check for
  an element already injected before creating another one.
* **Never trust page-derived strings as markup.** Repository names, group names and paths
  come from the URL and the DOM. Assign them with `textContent`, never by interpolating
  them into `innerHTML`.
* **Host styles are hostile.** Set every visual property explicitly on injected elements
  rather than relying on inheritance, and keep the wrapper at a `z-index` that survives the
  host's own stacking contexts.

## Cross-browser

* Target Chromium (`chrome.*`) as the baseline, and prefer call shapes that also work under
  Firefox's `browser.*` namespace. Where a callback-style API is used, wrap it once rather
  than at every call site.
* `chrome.storage.local` can fail — the extension context can be invalidated by a reload
  while a page is still open. Every storage read must survive that and return a usable
  empty value instead of throwing.
