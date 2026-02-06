(function() {
    // CONDITIONAL CHECK: Only run if this is a Repo Page
    if (!window.DC_GitHub || !window.DC_GitHub.list || !window.DC_GitHub.context.isRepoPage) return;
    
    const { cloneUrl } = window.DC_GitHub.context;
    const btn = window.DC_GitHub.createItem('Dev Container', '🐳', () => {
        const uri = `vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=${encodeURIComponent(cloneUrl)}`;
        window.location.href = uri;
    });
    
    window.DC_GitHub.addButton(btn);
})();