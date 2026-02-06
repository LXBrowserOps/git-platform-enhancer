(function() {
    if (!window.DC_GitHub || !window.DC_GitHub.list) return;
    
    const btn = window.DC_GitHub.createItem('Home', '🏠', () => {
        window.location.href = 'https://github.com';
    });
    
    window.DC_GitHub.addButton(btn);
})();