(function() {
    // Constraint: Only appear if we are on a Repo Page
    if (!window.DC_GitLab || !window.DC_GitLab.list || !window.DC_GitLab.context.isRepoPage) return;
    
    const { group } = window.DC_GitLab.context;
    
    // Create Button: Text is the Group Name
    const btn = window.DC_GitLab.createItem(group, '🏢', () => {
        window.location.href = `https://gitlab.com/${group}`;
    });
    
    window.DC_GitLab.addButton(btn);
})();