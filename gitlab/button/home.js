(function() {
    if (!window.DC_GitLab || !window.DC_GitLab.list) return;
    
    const btn = window.DC_GitLab.createItem('Home', '🏠', () => {
        window.location.href = 'https://gitlab.com';
    });
    
    window.DC_GitLab.addButton(btn);
})();