# Git Platform Enhancer

A modular browser extension (Manifest V3) that bridges web-based Git platforms and your
local development environment. It injects a floating utility menu into GitHub and GitLab
pages with context-aware tools for navigation, cloning, and project management.

## Features

* **Unified interface** across GitHub and GitLab.
* **VS Code hand-off** — clone a repository or open it in a Remote Dev Container in one
  click.
* **Favorites manager** — organize repositories into custom folders, stored locally and
  independent of GitHub Stars or GitLab.
* **Smart navigation** — the menu adapts to whether you are on a repository, an
  organization, or a dashboard.

## Quick start

There is no build step. Load the folder directly:

1. Clone or download this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.

Full instructions, including how to reload after a change:
[`wiki/environments/setup.md`](wiki/environments/setup.md).

## Documentation

| Page | What it covers |
|---|---|
| [`wiki/information/overview.md`](wiki/information/overview.md) | What the extension does, feature by feature. |
| [`wiki/information/architecture.md`](wiki/information/architecture.md) | How it is put together — injection model, modules, context detection. |
| [`wiki/environments/setup.md`](wiki/environments/setup.md) | Loading it, applying changes, and verifying by hand. |

The full map is [`.agents/index/project-wiki-index.md`](.agents/index/project-wiki-index.md).

## Permissions

The extension requests `storage` and nothing else — used to save your favorites list
locally. It makes no network requests and sends no telemetry.

## Working with agents

This repository uses the LXAgents shared agent instruction set. Start at
[`AGENTS.md`](AGENTS.md); the shared conventions are served by the `lxagents-agents-base`
MCP connector and are not vendored here.

## License

MIT. Copyright 2026 BrowserOps. See [`LICENSE`](LICENSE).
