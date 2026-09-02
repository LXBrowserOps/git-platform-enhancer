---
name: agent-wiki-sop-add-platform-adapter
description: How to add or change a platform adapter without leaking platform-specific behaviour into the shared runtime.
---

# SOP — Add or Change a Platform Adapter

The adapter interface itself is documented once, for humans, in
[`../../../wiki/reference/platform-adapter.md`](../../../wiki/reference/platform-adapter.md).
This page is the procedure and the constraint.

## The rule this exists to protect

`shared/` must contain **no branch on platform identity**. The moment a shared module
tests `platform.name`, or checks whether a URL contains `github.com`, the duplication this
structure removed has started to grow back in a place that is harder to see.

If shared code needs to behave differently per platform, the difference is a **new adapter
field**, added to every adapter and to the reference page in the same commit.

## Procedure

1. **Read the reference page first** and implement every field and method. A missing method
   fails at the moment a user clicks something, not at load.
2. **Write the adapter** at `{platform}/platform.js`, assigning to `window.DC.platform`.
   Keep it declarative — parsing, URLs, and names. No DOM construction; that is the
   runtime's job.
3. **Register it in `manifest.json`**: adapter first, shared modules next,
   `shared/bootstrap.js` last. Order in the `js` array is execution order and exists
   nowhere else.
4. **Pick a fresh `storageKey`.** Never reuse another platform's, and never rename an
   existing one — see
   [`../domain/favorites-data-safety.md`](../domain/favorites-data-safety.md).
5. **Verify on real pages of that host**, following
   [`../../../wiki/environments/setup.md`](../../../wiki/environments/setup.md). URL
   parsing is the part that breaks, and it cannot be checked by reading.

## When changing an existing adapter

`parseContext` is the highest-risk function in the repository: every downstream decision
reads its output. Changing it means re-checking the whole matrix of page shapes for that
platform — root, project, nested project, file view, sub-page, owner page, and the
reserved paths — not just the case that prompted the change.

A parsing change that is not exercised against every one of those shapes is not finished.
