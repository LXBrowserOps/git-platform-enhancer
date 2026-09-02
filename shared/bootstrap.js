// Entry point. Runs last, once the adapter and every shared module are defined.
//
// Both hosts are single-page applications: content scripts are injected once at
// document_idle and are never re-run when the user clicks an in-app link. The menu is
// therefore rebuilt whenever the URL changes, so its context never goes stale.
(function() {
    const platform = window.DC && window.DC.platform;
    if (!platform) return;

    // A content script can be injected more than once into the same frame.
    if (window.DC.__mounted) return;
    window.DC.__mounted = true;

    const POLL_MS = 400;
    let controller = null;
    let currentUrl = null;

    function unmount() {
        // Detaches every listener registered with this mount's signal.
        if (controller) { controller.abort(); controller = null; }
        const wrapper = document.getElementById('dev-container-menu-wrapper');
        if (wrapper) wrapper.remove();
        const modal = document.getElementById('dc-fav-modal');
        if (modal) modal.remove();
        window.DC.menu = null;
    }

    function mount() {
        unmount();
        if (!platform.canInject()) return;

        controller = new AbortController();
        const context = platform.parseContext(window.location.pathname);
        const menu = window.DC.buildMenu(platform, context);
        window.DC.menu = menu;
        window.DC.addButtons(menu);
        window.DC.initFavorites(menu, controller.signal);
    }

    function sync() {
        if (window.location.href === currentUrl) return;
        currentUrl = window.location.href;
        mount();
    }

    sync();

    // History is not shared with the page's own scripts from an isolated world, so a
    // pushState made by the host cannot be intercepted directly — the URL is polled
    // instead. popstate still fires here and makes back and forward feel immediate.
    window.addEventListener('popstate', sync);
    setInterval(sync, POLL_MS);
})();
