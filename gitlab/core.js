window.DC_GitLab = {
    wrapper: null,
    list: null,
    toggleBtn: null,
    context: {},
    
    createItem: function(text, icon, onClick) {
        const item = document.createElement('div');
        Object.assign(item.style, {
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px 20px',
            backgroundColor: '#1f1e24', border: '1px solid #45424d', color: '#ececef',
            borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap',
            transition: 'transform 0.2s, background-color 0.2s'
        });
        item.innerHTML = `<span style="margin-right: 10px; font-size: 1.3em;">${icon}</span>${text}`;
        item.onmouseover = () => { item.style.transform = 'translateX(-5px)'; item.style.backgroundColor = '#292931'; };
        item.onmouseout = () => { item.style.transform = 'translateX(0)'; item.style.backgroundColor = '#1f1e24'; };
        item.onclick = onClick;
        return item;
    },

    addButton: function(element) {
        if (this.list) this.list.appendChild(element);
    }
};

(function initCore() {
    // 1. Analyze Context
    if (!document.body) return;

    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    // UPDATED: Define reserved root paths that are NOT groups/users
    const reserved = ['dashboard', 'projects', 'groups', 'users', 'explore', 'help', 'admin', 'search', '-', 'profile'];
    
    // UPDATED: Check if the first part of the URL is reserved
    const isReserved = parts[0] && reserved.includes(parts[0]);

    // REPO LOGIC: Must have 2+ parts AND not start with a reserved word
    const isRepoContext = parts.length >= 2 && !isReserved;
    const isMetaPage = path.includes('/-/') && !path.includes('/-/tree/') && !path.includes('/-/blob/');
    const isRepoPage = isRepoContext && !isMetaPage;

    // ORG/GROUP LOGIC: Must be exactly 1 part AND not reserved
    const isOrgPage = parts.length === 1 && !isReserved;

    window.DC_GitLab.context = {
        group: parts[0] || '',
        pathName: isRepoContext ? parts.slice(0,2).join('/') : '', 
        cloneUrl: window.location.href,
        localPath: isRepoContext ? `gitlab/${parts.slice(0,2).join('/')}` : '',
        isRepoPage: isRepoPage,
        isOrgPage: isOrgPage
    };

    // 2. Create Wrapper
    const wrapper = document.createElement('div');
    wrapper.id = 'dev-container-menu-wrapper';
    Object.assign(wrapper.style, {
        position: 'fixed', bottom: '15px', right: '15px', zIndex: '2147483647',
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', 
        gap: '12px', pointerEvents: 'none',
        fontFamily: '"GitLab Sans", -apple-system, sans-serif'
    });
    window.DC_GitLab.wrapper = wrapper;

    const toggleBtn = document.createElement('div');
    toggleBtn.innerHTML = '+';
    Object.assign(toggleBtn.style, {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
        fontSize: '36px', fontWeight: '300', color: '#ffffff',
        background: 'linear-gradient(135deg, #fc6d26 0%, #7b58cf 100%)',
        boxShadow: '0 6px 16px rgba(123, 88, 207, 0.4)',
        transition: 'transform 0.3s, opacity 0.2s', pointerEvents: 'auto'
    });
    window.DC_GitLab.toggleBtn = toggleBtn;

    const list = document.createElement('div');
    window.DC_GitLab.list = list;
    Object.assign(list.style, {
        display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end',
        opacity: '0', transform: 'translateY(10px) scale(0.95)', transformOrigin: 'bottom right',
        transition: 'all 0.2s', pointerEvents: 'none', marginBottom: '5px'
    });

    let isOpen = false;
    toggleBtn.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            toggleBtn.innerHTML = '−';
            toggleBtn.style.transform = 'rotate(180deg)';
            toggleBtn.style.background = 'linear-gradient(135deg, #e24329 0%, #b62324 100%)';
            list.style.opacity = '1'; list.style.transform = 'translateY(0) scale(1)'; list.style.pointerEvents = 'auto';
            window.dispatchEvent(new CustomEvent('DC_GL_MenuOpened'));
        } else {
            toggleBtn.innerHTML = '+';
            toggleBtn.style.transform = 'rotate(0deg)';
            toggleBtn.style.background = 'linear-gradient(135deg, #fc6d26 0%, #7b58cf 100%)';
            list.style.opacity = '0'; list.style.transform = 'translateY(10px) scale(0.95)'; list.style.pointerEvents = 'none';
            window.dispatchEvent(new CustomEvent('DC_GL_MenuClosed'));
        }
    };

    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(list);
    document.body.appendChild(wrapper);
})();