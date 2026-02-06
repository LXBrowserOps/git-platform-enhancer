(function() {
    // Only appear on Org/User Profile pages
    if (!window.DC_GitHub || !window.DC_GitHub.list || !window.DC_GitHub.context.isOrgPage) return;
    
    const { org } = window.DC_GitHub.context;
    
    // Check if this is likely an Organization (vs a User) to form the correct URL
    // GitHub Orgs usually have this meta tag. Users do not.
    const isOrgType = !!document.querySelector('meta[name="hovercard-subject-tag"][content*="organization"]');
    
    const createUrl = isOrgType 
        ? `https://github.com/organizations/${org}/repositories/new`
        : `https://github.com/new`;

    const btn = window.DC_GitHub.createItem('Create Repository', '➕', () => {
        window.location.href = createUrl;
    });
    
    window.DC_GitHub.addButton(btn);
})();