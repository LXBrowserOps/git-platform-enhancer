// GitHub adapter. Everything that differs from GitLab lives here; the runtime in shared/
// is identical for both.
window.DC = window.DC || {};

window.DC.platform = {
    name: 'github',
    storageKey: 'gh_favorites',
    homeUrl: 'https://github.com',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    modalFontFamily: 'sans-serif',
    menuOpenedEvent: 'DC_MenuOpened',
    menuClosedEvent: 'DC_MenuClosed',

    // Gating on `.application-main` used to hide the menu entirely on newer
    // React-rendered pages, where that container no longer exists.
    canInject: function() {
        return !!document.body;
    },

    // GitHub repositories are /{owner}/{repo}. A third segment is a sub-page rather than
    // the repository root, except for the file browser. A reserved list excludes paths
    // that share the shape but are not repositories.
    parseContext: function(pathname) {
        const parts = pathname.split('/').filter(Boolean);

        const isRepoContext = parts.length >= 2;
        const isMetaPage = parts[2] && !['tree', 'blob', 'src'].includes(parts[2]);
        const isRepoPage = isRepoContext && !isMetaPage;

        const reserved = ['settings', 'marketplace', 'issues', 'pulls', 'notifications', 'new', 'organizations'];
        const isRoot = parts.length === 1 && !reserved.includes(parts[0]);
        const isOrgRepoList = parts.length === 3 && parts[0] === 'orgs' && parts[2] === 'repositories';

        return {
            owner: parts[0] || '',
            project: parts[1] || '',
            repoId: isRepoContext ? parts[0] + '/' + parts[1] : '',
            cloneUrl: window.location.href,
            localPath: isRepoContext ? 'github/' + parts[0] + '/' + parts[1] : '',
            isRepoPage: isRepoPage,
            isOrgPage: isRoot || isOrgRepoList
        };
    },

    savedPath: function(context) {
        return 'github/favorite/' + context.project;
    },

    // Organizations and users take different creation URLs, and only organizations carry
    // this meta tag.
    createRepoUrl: function(context) {
        const isOrgType = !!document.querySelector('meta[name="hovercard-subject-tag"][content*="organization"]');
        return isOrgType
            ? 'https://github.com/organizations/' + context.owner + '/repositories/new'
            : 'https://github.com/new';
    }
};
