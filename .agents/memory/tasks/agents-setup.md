---
name: memory-tasks-agents-setup
description: Record of the agent instruction system adoption for Git Platform Enhancer — mode, decisions, and what was created.
status: done
---

# Task — Agents Setup

**Goal.** Adopt the shared agent instruction system so every future session in this
repository activates the same conventions without being told.

**Objective.** A Mode B consuming repository: root `AGENTS.md` carrying the connector
bootstrap verbatim, a complete `.agents/` tree, both wiki trees, seed memory, and a first
release log — with nothing copied from the shared set.

This is task 1 of a five-task request. Tasks 2 through 5 cover the shared-runtime
extraction, the defect fixes, and the release; their record is
`.agents/memory/tasks/shared-platform-core.md`, created in task 2.

## Tasks

| # | Title | Branch | PR |
|---|---|---|---|
| 1 | Adopt the shared agent instruction set | `docs/agents-setup` | |

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Mode | B — consumer | The `lxagents-agents-base` connector is reachable; the remote is not the producer repository. |
| License | Unchanged — MIT, BrowserOps, 2026 | Already present and correct; setup does not restate a legal decision the repository has already made. |
| Initial log version | `1.0.0` | Matches the `version` field already in `manifest.json`. The release task raises it to `1.1.0`. |
| Branch naming | Shared strategy, five stacked branches | The session harness pinned a `claude/`-prefixed branch carrying a generated suffix, which the branching strategy forbids. The user was asked and chose the shared convention. |
| Commit trailers | `Co-Authored-By` kept, session trailer stripped | The harness appends a `Claude-Session:` trailer by default; the no-session-links rule forbids session identifiers in commits and outranks a tool-injected default. |
| Selected instruction files | Browser-extension rules, platform-adapter contract, favorites storage schema | Chosen by the user from the proposal. |
| Placement of the two selected wiki subjects | Facts in `wiki/`, agent constraints in `.agents/wiki/` | Both subjects have a human audience, so the directory rule's audience test puts the facts in the human tree with the agent page linking to them rather than duplicating. |
| Timing of the adapter contract page | Deferred to task 3 | It describes an interface that does not exist until the extraction lands. Writing it now would document code that is not there; change-propagation puts it in the same commit as the code. |

## Task 1 — `docs/agents-setup`

**Landed.** The full Mode B tree: `AGENTS.md`; six indexes under `.agents/index/`; two
local rules (`repository.md`, `browser-extension.md`); two agent wiki pages
(`context/repository-map.md`, `domain/favorites-data-safety.md`); four human wiki pages
under `wiki/`; this memory seed; and the `1.0.0` release log. `README.md` was rewritten as
an overview, with its architecture and feature detail relocated into `wiki/` rather than
deleted.

**Established for later tasks.** Six defects were found while reading the code and are
recorded in `.agents/wiki/context/repository-map.md`; tasks 3 and 4 depend on that list.
The favorites record schema is documented in `wiki/reference/favorites-storage.md` and is
the compatibility contract the extraction must not break.

**Left open.** The platform-adapter contract page, deliberately deferred to task 3. No
overrides were declared, so the override table is empty.
