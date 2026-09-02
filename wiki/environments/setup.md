# Setup

The extension loads directly from a checkout. There is nothing to install, compile, or
bundle.

## Load the extension

1. Clone or download this repository.
2. Open `chrome://extensions` in a Chromium-based browser (Chrome, Edge, Brave).
3. Enable **Developer mode** with the toggle in the top right.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json` — the repository root.

The extension appears in the list with its icon and version.

## Apply a change

Content scripts are injected when a page loads, so a change is not picked up by a tab that
is already open.

1. Edit the file.
2. Press **Reload** on the extension's card in `chrome://extensions`.
3. Hard-reload the GitHub or GitLab tab.

Skipping step 2 or 3 means testing the previous version of the code, which is the single
most common way to conclude that a working fix does not work.

## Verify by hand

There is no automated test suite. A change is verified by exercising it on both platforms,
because the two have separate URL parsers and separate code paths.

On **github.com** and again on **gitlab.com**, check:

| Page | Expected |
|---|---|
| A repository root | Menu opens; Dev Container, Auto Clone Local, and the owner button are present. |
| A repository sub-page (Issues, Settings) | Repository-only actions are absent. |
| An organization or group page | Create Repository is present. |
| The platform home or dashboard | Menu still appears; repository actions are absent. |
| A nested subgroup project (GitLab) | The owner button and clone path use the correct project path. |

For favorites, on both platforms: save the current repository, confirm the star fills,
open the browser modal, create a folder, move the entry into it, reopen the modal to
confirm the move persisted, then delete it.

## Inspect errors

Content-script errors appear in the **page's** DevTools console, not the extension's. Open
DevTools on the GitHub or GitLab tab itself.

To inspect stored favorites, run this in that same console — note it reads the extension's
storage only when executed from an extension context, so prefer the extension's own
DevTools via the "Inspect views" link on the extension card:

```js
chrome.storage.local.get(['gh_favorites', 'gl_favorites'], console.log);
```
