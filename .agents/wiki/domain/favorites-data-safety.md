---
name: agent-wiki-domain-favorites-data-safety
description: What an agent must never break when touching favorites storage, and how a schema change has to be migrated.
---

# Favorites Data Safety

The favorites list is **the only user-created data this extension holds**, it exists solely
in the user's browser profile, and there is no export, no sync, and no backup. Nothing
warns a user before it is lost, and nothing can recover it afterwards.

The record schema itself is documented once, for humans, in
[`../../../wiki/reference/favorites-storage.md`](../../../wiki/reference/favorites-storage.md).
This page is the constraint an agent must respect.

## Never, without an explicit migration

* **Never rename a storage key.** `gh_favorites` and `gl_favorites` are the addresses of
  real user data. A rename does not move it; it orphans it, and the user sees an empty
  list.
* **Never change the meaning of an existing field.** Records already written to disk carry
  the old meaning, and nothing re-reads them to fix it.
* **Never remove a field another part of the code still reads**, and never assume a field
  is present in an old record just because current code always writes it.
* **Never drop unknown fields when rewriting a record.** Read, modify, write back whole.

## Adding to the schema

Adding an optional field is safe when, and only when, every reader treats its absence as
valid. Write the default at read time, not by rewriting the whole store.

## When a migration is genuinely required

1. Detect the old shape by what it lacks, never by a version counter that old records do
   not carry.
2. Convert on read, write back once, and keep the conversion in place — users open the
   extension on their own schedule, and a migration removed after one release will miss
   the profile that was not opened that month.
3. Make it idempotent. It will run again.
4. Never delete a record the migration failed to understand. Leave it untouched.

## Cross-platform

GitHub and GitLab favorites are separate stores that happen to share a record shape. Do not
merge, mirror, or cross-read them: repository identifiers collide across the two hosts, and
the same string means different things on each.
