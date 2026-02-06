(function() {
    // CONDITIONAL CHECK: Only run if this is a Repo Page
    if (!window.DC_GitHub || !window.DC_GitHub.list || !window.DC_GitHub.context.isRepoPage) return;
    
    const { localPath, cloneUrl } = window.DC_GitHub.context;
    const btn = window.DC_GitHub.createItem('Auto Clone Local', '📂', async () => {
        try {
            await navigator.clipboard.writeText(localPath);
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                const uri = `vscode://vscode.git/clone?url=${encodeURIComponent(cloneUrl)}`;
                window.location.href = uri;
            }, 800);
        } catch (err) { console.error('Clipboard failed', err); }
    });
    
    window.DC_GitHub.addButton(btn);
})();