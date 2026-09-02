// Entry point. Runs last, once the adapter and every shared module are defined.
(function() {
    const platform = window.DC && window.DC.platform;
    if (!platform) return;
    if (!platform.canInject()) return;

    const context = platform.parseContext(window.location.pathname);
    const menu = window.DC.buildMenu(platform, context);
    window.DC.menu = menu;

    window.DC.addButtons(menu);
    window.DC.initFavorites(menu);
})();
