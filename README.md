# Git Platform Enhancer

**Git Platform Enhancer** is a modular browser extension (Manifest V3) designed to bridge the gap between web-based Git platforms (GitHub and GitLab) and local development environments (VS Code).

It injects a floating utility menu into repository and organization pages, offering context-aware tools for navigation, local cloning, and project management.

---

## 🚀 Key Features

### 1. Unified Interface
The extension works seamlessly across **GitHub** and **GitLab**, adapting its visual style (colors, gradients, and fonts) to match the platform you are currently using.

### 2. VS Code Deep Integration
Streamline your workflow from the browser to your editor:
* **Auto Clone Local:** Copies the local folder path to your clipboard and immediately triggers VS Code to clone the repository (`vscode://vscode.git/clone`).
* **Dev Containers:** Instantly open the current repository in a VS Code Remote Dev Container using Docker (`vscode://ms-vscode-remote...`).

### 3. Advanced Favorites Manager
A custom bookmarking system fully independent of GitHub Stars or GitLab functionality:
* **Custom Folders:** Organize repositories into custom folders (e.g., "Work," "Personal," "Urgent").
* **Local Storage:** Data is saved securely in your browser's local storage (`chrome.storage.local`).
* **File Explorer UI:** A built-in modal to browse, search, move, and delete saved repositories.
* **Quick Pin:** A dedicated floating "Star" button to quickly toggle the saved status of the current repo.

### 4. Smart Navigation
* **Context Awareness:** The menu detects if you are on a Repository, Organization, or Dashboard page.
* **Quick Links:** * Jump to the Owner/Organization profile.
    * One-click "Create New Repository" (pre-filled with context).
    * Quick "Home" button.

---

## 🛠 Architecture & How It Works

The extension utilizes a **modular architecture** defined in `manifest.json`.

### Core Logic
* **`core.js`**: The entry point. It analyzes the current URL path to build a context object (`window.DC_GitLab.context` or `window.DC_GitHub.context`). It determines if the user is viewing a Repo, an Org, or a Meta-page and injects the floating menu wrapper.
* **`manifest.json`**: Controls script injection. It creates separate sandboxes for GitHub and GitLab to ensure style isolation.

### Modules (Plugins)
Specific features are loaded as independent scripts that attach themselves to the Core menu:
* **`favorite.js`**: Handles the complex logic for the Favorites system, including the modal UI, folder management, and storage/retrieval operations.
* **`auto_clone_local.js`**: Generates the VS Code URI scheme for cloning.
* **`dev_container.js`**: Generates the VS Code URI scheme for Remote Containers.
* **`goto_org.js` / `home.js`**: Simple navigation helpers.

---

## 📦 Installation

1.  Download or clone this repository.
2.  Open your browser (Chrome/Edge/Brave) and navigate to `chrome://extensions`.
3.  Enable **Developer Mode** (toggle in the top right).
4.  Click **Load unpacked**.
5.  Select the folder containing `manifest.json`.

---

## 🔒 Permissions

* **`storage`**: Required to save your custom Favorites list and Folder structure locally in the browser.

---

## 📄 License

**Copyright 2026 BrowserOps.**

The software is provided "AS IS", without warranty of any kind. See the [`LICENSE`](https://github.com/BrowserOps/git-platform-enhancer/blob/master/LICENSE) file for details.
