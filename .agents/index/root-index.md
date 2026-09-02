---
name: root-index
description: Router for Git Platform Enhancer — lists every local index and the shared router, and carries the override table.
---

# Root Index

This file lists **indexes only**. It never contains rules, documentation, prose, or direct
links to leaf content. Read exactly one branch per task, plus
[`memory-index.md`](memory-index.md).

## Indexes

| Index | Scope | Load when |
|---|---|---|
| [`agents-index.md`](agents-index.md) | This repository's instruction set | You need a rule specific to this repository. |
| `{shared}/index/root-index.md` | The shared instruction set | You need a branching, commit, pull request, planning, or creator convention. |
| [`agent-wiki-index.md`](agent-wiki-index.md) | `.agents/wiki/` agent knowledge | You need an SOP, domain guideline, or operating context written for agents. |
| [`project-wiki-index.md`](project-wiki-index.md) | `wiki/` human documentation | You need to read or write documentation a person will read. |
| [`memory-index.md`](memory-index.md) | `.agents/memory/` dynamic state | You need prior task state or must record progress. |
| [`logs-index.md`](logs-index.md) | `wiki/logs/` versioned change logs | You need release history or must record a change. |

## Shared Overrides

No overrides — this repository uses the shared set unchanged.

Adding, removing, or renaming any index updates the first table **in the same commit**.
Adding or dropping an override updates the second table in the same commit.
