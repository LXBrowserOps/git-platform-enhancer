// The floating menu: wrapper, toggle button, and the list feature modules attach to.
window.DC = window.DC || {};

window.DC.buildMenu = function(platform, context) {
    const ui = window.DC.ui;
    const T = ui.tokens;

    const wrapper = document.createElement('div');
    wrapper.id = 'dev-container-menu-wrapper';
    Object.assign(wrapper.style, {
        position: 'fixed', bottom: '15px', right: '15px', zIndex: T.Z,
        display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end',
        gap: '12px', pointerEvents: 'none',
        fontFamily: platform.fontFamily
    });

    const toggleBtn = ui.createFab({
        width: '60px', height: '60px', fontSize: '36px', fontWeight: '300',
        background: T.fabRest,
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 8px 32px rgba(120, 130, 150, 0.3)',
        transition: 'transform 0.3s ease, opacity 0.2s ease, background 0.3s ease'
    });
    toggleBtn.innerHTML = '+';

    const list = document.createElement('div');
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
            toggleBtn.style.background = T.fabOpen;
            list.style.opacity = '1';
            list.style.transform = 'translateY(0) scale(1)';
            list.style.pointerEvents = 'auto';
            window.dispatchEvent(new CustomEvent(platform.menuOpenedEvent));
        } else {
            toggleBtn.innerHTML = '+';
            toggleBtn.style.transform = 'rotate(0deg)';
            toggleBtn.style.background = T.fabRest;
            list.style.opacity = '0';
            list.style.transform = 'translateY(10px) scale(0.95)';
            list.style.pointerEvents = 'none';
            window.dispatchEvent(new CustomEvent(platform.menuClosedEvent));
        }
    };

    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(list);
    document.body.appendChild(wrapper);

    return {
        platform: platform,
        context: context,
        wrapper: wrapper,
        list: list,
        toggleBtn: toggleBtn,
        createItem: ui.createItem,
        addButton: function(element) { if (this.list) this.list.appendChild(element); }
    };
};
