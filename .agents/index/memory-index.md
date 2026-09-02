---
name: memory-index
description: Index of .agents/memory/ — task records and repository state, read every session for continuity.
---

# Memory Index

**Scope:** `.agents/memory/`
**Parent:** [`root-index.md`](root-index.md)

This index is read on **every** session, and the rows whose scope matches the current
request are loaded before work begins.

## state/

| File | Scope | Purpose |
|---|---|---|
| [`../memory/state/repository-state.md`](../memory/state/repository-state.md) | Whole repository | Current known state — what exists, what is in flight, what is not yet built. |

## tasks/

| File | Scope | Purpose |
|---|---|---|
| [`../memory/tasks/shared-platform-core.md`](../memory/tasks/shared-platform-core.md) | Extension source | Confirmed task list and decisions for the shared-runtime extraction. |
| [`../memory/tasks/agents-setup.md`](../memory/tasks/agents-setup.md) | Instruction system | Record of the agent instruction system adoption. |

Any file added to or removed from `.agents/memory/` is reflected here in the same commit.
