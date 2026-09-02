# Overview

Git Platform Enhancer is a browser extension (Manifest V3) that bridges web-based Git
platforms and a local VS Code environment. It injects a floating utility menu into GitHub
and GitLab pages, offering context-aware tools for navigation, cloning, and project
management.

## What it does

### Unified interface

The extension works across **GitHub** and **GitLab**, adapting to the platform it is
running on. The menu appears as a floating button in the bottom-right corner of the page
and expands into a list of actions relevant to the current page.

### VS Code hand-off

* **Auto Clone Local** — copies the suggested local folder path to the clipboard, then
  hands the repository URL to VS Code via `vscode://vscode.git/clone`.
* **Dev Container** — opens the current repository in a VS Code Remote Dev Container via
  `vscode://ms-vscode-remote.remote-containers/cloneInVolume`.

Both are URI hand-offs. The extension does not clone anything itself and never runs a
command on the machine.

### Favorites manager

A bookmarking system independent of GitHub Stars and GitLab's own features:

* **Custom folders** — organize saved repositories into folders such as "Work" or
  "Urgent". A repository can live in several folders at once.
* **Local storage** — everything is stored in the browser profile via
  `chrome.storage.local`. Nothing leaves the machine.
* **Browser modal** — search, filter by first letter, move between folders, and delete.
* **Quick pin** — a floating star button toggles the saved state of the current
  repository.

The stored record shape is documented in
[`../reference/favorites-storage.md`](../reference/favorites-storage.md).

### Smart navigation

The menu detects whether the current page is a repository, an organization or group, or
neither, and shows only the actions that apply:

* Jump to the owning organization or group.
* Create a new repository, pre-filled with context where the platform allows it.
* Return to the platform home page.

## Privacy

The extension requests a single permission, `storage`. It makes no network requests, sends
no telemetry, and holds no account credentials. The favorites list never leaves the
browser profile it was created in.

## Limitations

* Chromium-based browsers are the supported target.
* Only `github.com` and `gitlab.com` are matched. Self-hosted instances are not.
* The VS Code buttons require VS Code installed and registered for the `vscode://` URI
  scheme.
