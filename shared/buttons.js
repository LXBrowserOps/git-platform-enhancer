// The simple menu items. Each checks its own precondition and adds nothing when it does
// not hold — that is what makes the menu context-aware, rather than any filtering step.
window.DC = window.DC || {};

window.DC.addButtons = function(menu) {
    const { platform, context } = menu;

    // Home — always available.
    menu.addButton(menu.createItem('Home', '🏠', () => {
        window.location.href = platform.homeUrl;
    }));

    // Create Repository — only on an organization or group page.
    if (context.isOrgPage) {
        const createUrl = platform.createRepoUrl(context);
        menu.addButton(menu.createItem('Create Repository', '➕', () => {
            window.location.href = createUrl;
        }));
    }

    // Owner — only where an owner is defined, labelled with its name.
    if (context.isRepoPage) {
        menu.addButton(menu.createItem(context.owner, '🏢', () => {
            window.location.href = platform.homeUrl + '/' + context.owner;
        }));
    }

    if (!context.isRepoPage) return;

    // Dev Container — hand the repository to VS Code Remote Containers.
    menu.addButton(menu.createItem('Dev Container', '🐳', () => {
        window.location.href = 'vscode://ms-vscode-remote.remote-containers/cloneInVolume?url='
            + encodeURIComponent(context.cloneUrl);
    }));

    // Auto Clone Local — copy the suggested path, then hand the URL to VS Code.
    const cloneBtn = menu.createItem('Auto Clone Local', '📂', async () => {
        try {
            await navigator.clipboard.writeText(context.localPath);
            const originalHTML = cloneBtn.innerHTML;
            cloneBtn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                cloneBtn.innerHTML = originalHTML;
                window.location.href = 'vscode://vscode.git/clone?url='
                    + encodeURIComponent(context.cloneUrl);
            }, 800);
        } catch (err) { console.error('Clipboard failed', err); }
    });
    menu.addButton(cloneBtn);
};
