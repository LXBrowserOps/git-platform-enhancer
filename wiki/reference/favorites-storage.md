# Favorites Storage

Favorites are stored with `chrome.storage.local`, in the user's browser profile. Nothing is
synced and nothing is sent anywhere.

## Keys

| Key | Holds |
|---|---|
| `gh_favorites` | Every GitHub folder and saved repository. |
| `gl_favorites` | Every GitLab folder and saved repository. |

The two are independent and are never merged. Repository identifiers can collide across
the platforms, so a record only means anything within its own key.

## Shape

Each key holds a **flat array of records**. The folder tree is encoded by reference: every
record names its parent through `parentId`, and the string `root` is the top level. There
is no nesting in the stored data itself.

Two record types share the array, distinguished by `type`.

### Folder

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique identifier, generated as `folder_` followed by a timestamp. |
| `type` | string | `folder`. |
| `name` | string | The display name the user typed. |
| `parentId` | string | The containing folder's `id`, or `root`. |
| `timestamp` | number | Creation time, milliseconds since epoch. |

### Pin

A pin is one saved repository in one folder. Saving the same repository to two folders
creates two pin records with the **same `id`**, so a pin is identified by the combination
of `id`, `type` and `parentId` — never by `id` alone.

| Field | Type | Meaning |
|---|---|---|
| `id` | string | The repository identifier — `owner/repo` on GitHub, the project path on GitLab. |
| `type` | string | `pin`. |
| `name` | string | Display name; the same value as `id`. |
| `parentId` | string | The containing folder's `id`, or `root`. |
| `path` | string | Suggested local folder path, shown when cloning. |
| `url` | string | The page URL captured when the repository was saved. |
| `timestamp` | number | Save time, milliseconds since epoch. |

## Reading it

From the extension's own DevTools console — reachable through "Inspect views" on the
extension card in `chrome://extensions`:

```js
chrome.storage.local.get(['gh_favorites', 'gl_favorites'], console.log);
```

## Compatibility

This data has no version field and no export path. Changing the schema without a migration
silently destroys real user data; the rules that govern such a change are in the agent
instruction set, at `.agents/wiki/domain/favorites-data-safety.md`.
