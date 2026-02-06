(function() {
    if (!window.DC_GitLab || !window.DC_GitLab.list || !window.DC_GitLab.context.isRepoPage) return;
    
    const { localPath, cloneUrl } = window.DC_GitLab.context;
    const btn = window.DC_GitLab.createItem('Auto Clone Local', '📂', async () => {
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
    
    window.DC_GitLab.addButton(btn);
})();