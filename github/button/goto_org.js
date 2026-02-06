(function() {
    // Constraint: Only appear if we are on a Repo Page (Context where an Org is defined)
    if (!window.DC_GitHub || !window.DC_GitHub.list || !window.DC_GitHub.context.isRepoPage) return;
    
    const { org } = window.DC_GitHub.context;
    
    // Create Button: Text is the Org Name (e.g., "MCEngine")
    const btn = window.DC_GitHub.createItem(org, '🏢', () => {
        window.location.href = `https://github.com/${org}`;
    });
    
    window.DC_GitHub.addButton(btn);
})();