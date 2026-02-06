window.DC_GitHub = {
    wrapper: null,
    list: null,
    toggleBtn: null,
    context: {},
    
    createItem: function(text, icon, onClick) {
        const item = document.createElement('div');
        Object.assign(item.style, {
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px 20px',
            backgroundColor: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9',
            borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap',
            transition: 'transform 0.2s, background-color 0.2s'
        });
        item.innerHTML = `<span style="margin-right: 10px; font-size: 1.3em;">${icon}</span>${text}`;
        item.onmouseover = () => { item.style.transform = 'translateX(-5px)'; item.style.backgroundColor = '#161b22'; };
        item.onmouseout = () => { item.style.transform = 'translateX(0)'; item.style.backgroundColor = '#0d1117'; };
        item.onclick = onClick;
        return item;
    },

    addButton: function(element) {
        if (this.list) this.list.appendChild(element);
    }
};

(function initCore() {
    // 1. Analyze Context
    // We now allow running on almost any page to support Org views
    if (!document.querySelector('.application-main')) return; 

    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    
    // REPO LOGIC: /org/repo (and not /org/repo/settings etc unless it's tree/blob)
    const isRepoContext = parts.length >= 2;
    const isMetaPage = parts[2] && !['tree', 'blob', 'src'].includes(parts[2]); 
    const isRepoPage = isRepoContext && !isMetaPage;

    // ORG LOGIC: /org or /org/repositories
    // Exclude reserved paths like /settings, /marketplace, /issues, /pulls
    const reserved = ['settings', 'marketplace', 'issues', 'pulls', 'notifications', 'new', 'organizations'];
    const isRoot = parts.length === 1 && !reserved.includes(parts[0]);
    const isOrgRepoList = parts.length === 3 && parts[0] === 'orgs' && parts[2] === 'repositories'; // New GitHub org view
    const isOrgPage = isRoot || isOrgRepoList;

    window.DC_GitHub.context = {
        org: parts[0] || '',
        repo: parts[1] || '',
        cloneUrl: window.location.href,
        localPath: isRepoContext ? `github/${parts[0]}/${parts[1]}` : '',
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    });
    window.DC_GitHub.wrapper = wrapper;

    const toggleBtn = document.createElement('div');
    toggleBtn.innerHTML = '+';
    Object.assign(toggleBtn.style, {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
        fontSize: '36px', fontWeight: '300', color: '#ffffff',
        background: 'linear-gradient(135deg, #1f6feb 0%, #0d1117 100%)',
        border: '1px solid #30363d', boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
        transition: 'transform 0.3s, opacity 0.2s', pointerEvents: 'auto'
    });
    window.DC_GitHub.toggleBtn = toggleBtn;

    const list = document.createElement('div');
    window.DC_GitHub.list = list;
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
            toggleBtn.style.background = 'linear-gradient(135deg, #da3633 0%, #b62324 100%)';
            list.style.opacity = '1'; list.style.transform = 'translateY(0) scale(1)'; list.style.pointerEvents = 'auto';
            window.dispatchEvent(new CustomEvent('DC_MenuOpened'));
        } else {
            toggleBtn.innerHTML = '+';
            toggleBtn.style.transform = 'rotate(0deg)';
            toggleBtn.style.background = 'linear-gradient(135deg, #1f6feb 0%, #0d1117 100%)';
            list.style.opacity = '0'; list.style.transform = 'translateY(10px) scale(0.95)'; list.style.pointerEvents = 'none';
            window.dispatchEvent(new CustomEvent('DC_MenuClosed'));
        }
    };

    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(list);
    document.body.appendChild(wrapper);
})();