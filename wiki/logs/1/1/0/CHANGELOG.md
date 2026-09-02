# 1.1.0

Released 2026-09-02. The duplicated GitHub and GitLab code becomes one shared runtime with
a thin adapter per platform, and seven defects are fixed.

Existing favorites are unaffected: the storage keys and the record schema are unchanged,
and no migration runs.

## Added

* `shared/` — one runtime used by both platforms: `ui`, `storage`, `core`, `buttons`,
  `favorites`, and `bootstrap`.
* A platform adapter interface, documented in
  [`../../../../reference/platform-adapter.md`](../../../../reference/platform-adapter.md).
  Adding a Git platform means writing one adapter and a manifest entry; no shared file
  needs to change.
* Working **Move** action in the favorites browser — the button existed but had never
  functioned.
* Menu rebuilding on in-app navigation, so the menu keeps up with single-page routing on
  both hosts.
* Firefox support in the storage layer, which now prefers `browser.storage.local` where it
  exists.

## Changed

* Each platform is reduced to `{platform}/platform.js`, holding only what genuinely
  differs: URL parsing, storage key, host URLs, fonts, and event names.
* `manifest.json` loads the adapter first, the shared modules next, and
  `shared/bootstrap.js` last.
* Folder membership is saved in a single read and write rather than a pair per folder, and
  the browser modal reads storage once instead of three times.
* The internal namespace is a single `window.DC` rather than one per platform.

## Fixed

* The **Move** button threw on every click on both platforms: `FS.moveItem` was called but
  never defined.
* Deleting one saved copy of a repository removed it from **every** folder, because pins
  were addressed by `id` alone. A pin is now identified by `id`, `type` and `parentId`.
* Deleting a folder left records beneath it orphaned in storage; deletion now cascades to
  any depth.
* The menu never appeared on newer React-rendered GitHub pages, which no longer contain
  the `.application-main` container it was gated on.
* A GitLab project inside nested subgroups was truncated to its subgroup, producing the
  wrong clone path and the wrong favorites entry.
* After clicking an in-app link, the menu kept describing the page the tab was opened on.

## Security

* Repository, group, and folder names taken from the URL were interpolated into
  `innerHTML`, so a crafted repository path could inject and execute markup inside the
  extension's own UI. All page-derived text is now added as text nodes.
