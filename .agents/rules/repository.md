---
name: repository-rules
description: Rules for working in Git Platform Enhancer — mode, layout, conventions the code already follows, and what must not be introduced.
---

# Repository Rules

## Mode and shared set

This repository is a **Mode B consumer**. The shared instruction set is resolved through
the `lxagents-agents-base` MCP connector and is never vendored here. This repository
carries only its own indexes, rules, wikis and memory. See
[`{shared}/rules/mcp-connector.md`](agents://rules/mcp-connector.md).

## What this project is

A Manifest V3 browser extension. Plain browser JavaScript, **no build step, no package
manager, no dependency tree, and no test framework**. What is in the repository is exactly
what the browser loads. Orientation, commands and gotchas live in
[`../wiki/context/repository-map.md`](../wiki/context/repository-map.md).

## Layout

| Path | Holds |
|---|---|
| `manifest.json` | The extension manifest — the single registry of which scripts load on which host. |
| `github/`, `gitlab/` | Per-platform content scripts. |
| `icon.png` | The 128px extension icon. |

A new script file is only reachable once it is registered in `manifest.json`. Adding a file
without adding it there is a silent no-op, and nothing in the repository will fail to warn
you.

## Conventions the code already follows

* **Content scripts are IIFEs.** Every module wraps itself in `(function() { … })()` and
  bails early when its prerequisites are missing, rather than throwing.
* **Styling is inline**, applied with `Object.assign(el.style, { … })`. There is no
  stylesheet, because a content script must not leak styles into the host page or inherit
  them from it.
* **A shared namespace on `window`** carries the menu handles and the parsed page context
  between modules. Content scripts run in an isolated world, so this namespace is not
  visible to the host page.
* **Load order is significant.** The core module must run before any module that attaches
  to it; `manifest.json` encodes that order and is the only place it is expressed.

Match the surrounding style rather than introducing a new one.

## What must not be introduced

* **No build step, bundler, transpiler, or `node_modules`.** The repository must stay
  loadable with "Load unpacked" exactly as it sits.
* **No remote code.** No CDN script, no `eval`, no remotely hosted configuration. Manifest
  V3 forbids it and extension stores reject it.
* **No new permission** in `manifest.json` without an explicit user decision — a permission
  widens what the extension may do and what a reviewer must justify. See
  [`browser-extension.md`](browser-extension.md).
* **No telemetry, analytics, or network call** of any kind. The extension reads the page it
  is on and writes to local storage; it must have no other outward surface.
* **No breaking change to stored favorites** without a migration — see
  [`../wiki/domain/favorites-data-safety.md`](../wiki/domain/favorites-data-safety.md).

## Verifying a change

There is no automated test suite, so a change is verified by loading the extension and
exercising it on both platforms. The procedure is in
[`../../wiki/environments/setup.md`](../../wiki/environments/setup.md). A change that
touches both platforms is verified on both — the two hosts parse URLs differently, and a
fix that works on one routinely does nothing on the other.
