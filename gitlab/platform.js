// GitLab adapter. Everything that differs from GitHub lives here; the runtime in shared/
// is identical for both.
window.DC = window.DC || {};

window.DC.platform = {
    name: 'gitlab',
    storageKey: 'gl_favorites',
    homeUrl: 'https://gitlab.com',
    fontFamily: '"GitLab Sans", -apple-system, sans-serif',
    modalFontFamily: '"GitLab Sans", sans-serif',
    menuOpenedEvent: 'DC_GL_MenuOpened',
    menuClosedEvent: 'DC_GL_MenuClosed',

    canInject: function() {
        return !!document.body;
    },

    // GitLab allows nested groups, so a project path is not a fixed number of segments.
    // The /-/ separator marks the end of the project path and the start of a sub-page.
    parseContext: function(pathname) {
        const parts = pathname.split('/').filter(Boolean);

        const reserved = ['dashboard', 'projects', 'groups', 'users', 'explore', 'help', 'admin', 'search', '-', 'profile'];
        const isReserved = parts[0] && reserved.includes(parts[0]);

        // Everything before the /-/ separator is the project path, however many groups
        // it nests through. Taking the first two segments truncated any project in a
        // subgroup to the subgroup itself.
        const projectParts = pathname.split('/-/')[0].split('/').filter(Boolean);

        const isRepoContext = projectParts.length >= 2 && !isReserved;
        const isMetaPage = pathname.includes('/-/')
            && !pathname.includes('/-/tree/')
            && !pathname.includes('/-/blob/');
        const isRepoPage = isRepoContext && !isMetaPage;
        const isOrgPage = parts.length === 1 && !isReserved;

        const projectPath = isRepoContext ? projectParts.join('/') : '';

        return {
            owner: parts[0] || '',
            project: projectPath,
            repoId: projectPath,
            cloneUrl: window.location.href,
            localPath: isRepoContext ? 'gitlab/' + projectPath : '',
            isRepoPage: isRepoPage,
            isOrgPage: isOrgPage
        };
    },

    savedPath: function(context) {
        return 'gitlab/favorite/' + context.project;
    },

    createRepoUrl: function() {
        return 'https://gitlab.com/projects/new';
    }
};
