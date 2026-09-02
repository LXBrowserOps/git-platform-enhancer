# Platform Adapter

The extension has one runtime, in `shared/`, and one **adapter** per Git platform. The
adapter holds everything that differs between hosts; the runtime holds everything that
does not.

An adapter is a plain object assigned to `window.DC.platform`. It is loaded first, before
any shared module, and `shared/bootstrap.js` reads it last.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `name` | string | Short platform identifier, e.g. `github`. |
| `storageKey` | string | The `chrome.storage.local` key holding this platform's favorites. **Never change an existing one** — it is the address of real user data. |
| `homeUrl` | string | Origin without a trailing slash, e.g. `https://github.com`. Used for the Home button and to build the owner link. |
| `fontFamily` | string | Font stack for the floating menu. |
| `modalFontFamily` | string | Font stack for the modals. |
| `menuOpenedEvent` | string | Name of the event dispatched when the main menu opens. |
| `menuClosedEvent` | string | Name of the event dispatched when it closes. |

## Methods

### `canInject(): boolean`

Whether the extension should run on this document. Called before anything is built.

### `parseContext(pathname): Context`

Turns `window.location.pathname` into the context object the whole runtime reads. This is
the only place URL structure is interpreted, and it is where the two platforms differ
most.

| Context field | Type | Meaning |
|---|---|---|
| `owner` | string | Organization, group, or user that owns the page. Empty when there is none. |
| `project` | string | Project identifier within the owner. On GitHub the repository name; on GitLab the full project path. |
| `repoId` | string | Stable identifier used as the favorites record `id`. Empty when not in a repository context. |
| `cloneUrl` | string | URL handed to VS Code. |
| `localPath` | string | Suggested local folder path, copied to the clipboard on clone. |
| `isRepoPage` | boolean | The page is a repository root or file view — not a sub-page such as Issues or Settings. |
| `isOrgPage` | boolean | The page is an organization or group page. |

`isRepoPage` and `isOrgPage` are mutually exclusive on both current platforms.

### `savedPath(context): string`

The `path` recorded on a new pin — the local folder suggested for that repository.

### `createRepoUrl(context): string`

Where the Create Repository button points. May inspect the DOM: GitHub uses different URLs
for organizations and users and distinguishes them by a meta tag.

## Adding a platform

1. Write `{platform}/platform.js` implementing every field and method above.
2. Add a `content_scripts` entry to `manifest.json` matching the host, listing the adapter
   **first**, then the shared modules, with `shared/bootstrap.js` **last**. Order in that
   array is execution order.
3. Choose a new `storageKey`. Favorites are never shared between platforms — repository
   identifiers collide across hosts.

No file in `shared/` should need to change. If one does, the difference belongs in the
adapter interface rather than in a branch inside the runtime.
