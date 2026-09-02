# 1.0.0

Released 2026-09-02. Initial published state of Git Platform Enhancer, plus adoption of
the agent instruction system.

## Added

* Manifest V3 extension injecting a floating utility menu into GitHub and GitLab
  repository, organization, and dashboard pages.
* Per-platform content-script trees under `github/` and `gitlab/`, each with a `core.js`
  entry point that parses page context and six feature modules that attach to it.
* VS Code hand-off: **Auto Clone Local** (`vscode://vscode.git/clone`) and **Dev
  Container** (`vscode://ms-vscode-remote.remote-containers/cloneInVolume`).
* Favorites manager backed by `chrome.storage.local` — custom folders, quick-pin star
  button, search, alphabet filter, and a browser modal for moving and deleting entries.
* Navigation helpers: jump to the owning organization or group, create a repository, and
  return to the platform home.
* Glassmorphism styling across the menu, floating buttons, and modals.
* Agent instruction system: root `AGENTS.md` resolving the shared set through the
  `lxagents-agents-base` connector, a local `.agents/` tree with six indexes, repository
  and browser-extension rules, agent knowledge pages, and seed memory.
* Human documentation under `wiki/` — overview, architecture, setup, and the favorites
  storage reference.
