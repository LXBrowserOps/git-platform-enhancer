(function() {
    // Only appear on Group/User pages
    if (!window.DC_GitLab || !window.DC_GitLab.list || !window.DC_GitLab.context.isOrgPage) return;
    
    const { group } = window.DC_GitLab.context;
    
    // GitLab URL for new project in a specific group
    const createUrl = `https://gitlab.com/projects/new`;

    const btn = window.DC_GitLab.createItem('Create Repository', '➕', () => {
        window.location.href = createUrl;
    });
    
    window.DC_GitLab.addButton(btn);
})();