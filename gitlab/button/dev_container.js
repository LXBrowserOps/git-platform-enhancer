(function() {
    if (!window.DC_GitLab || !window.DC_GitLab.list || !window.DC_GitLab.context.isRepoPage) return;
    
    const { cloneUrl } = window.DC_GitLab.context;
    const btn = window.DC_GitLab.createItem('Dev Container', '🐳', () => {
        const uri = `vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=${encodeURIComponent(cloneUrl)}`;
        window.location.href = uri;
    });
    
    window.DC_GitLab.addButton(btn);
})();