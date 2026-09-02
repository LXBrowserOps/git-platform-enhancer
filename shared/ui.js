// Shared visual language and DOM helpers.
// Every injected element sets its properties explicitly: a content script shares the DOM
// with a host page that has its own CSS, so nothing may be inherited.
window.DC = window.DC || {};

window.DC.ui = (function() {
    const GLASS = 'blur(18px) saturate(180%)';
    const PANEL_GLASS = 'blur(24px) saturate(180%)';

    const T = {
        itemBg: 'rgba(255, 255, 255, 0.55)',
        itemBgHover: 'rgba(255, 255, 255, 0.85)',
        itemBorder: 'rgba(255, 255, 255, 0.65)',
        itemShadow: '0 8px 32px rgba(120, 130, 150, 0.22)',
        itemShadowHover: '0 10px 36px rgba(120, 130, 150, 0.32)',
        text: '#2b2f36',
        textMuted: '#6b7280',
        fabText: '#3a3f47',
        fabRest: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(214,220,229,0.7) 100%)',
        fabOpen: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(186,196,210,0.8) 100%)',
        gold: '#b8860b',
        goldBorder: 'rgba(212, 175, 55, 0.6)',
        line: 'rgba(180, 190, 205, 0.4)',
        lineStrong: 'rgba(180, 190, 205, 0.5)',
        accent: 'linear-gradient(135deg, #8a94a6, #aab2c0)',
        danger: 'linear-gradient(135deg, #ff6b6b, #e04a4a)',
        confirm: 'linear-gradient(135deg, #34c759, #28a745)',
        surface: 'rgba(255, 255, 255, 0.45)',
        Z: '2147483647'
    };

    function itemMarkup(icon, text) {
        return '<span style="margin-right: 10px; font-size: 1.3em;">' + icon + '</span>' + text;
    }

    return {
        tokens: T,

        // A menu row. `icon` and `text` are rendered as markup, matching the original.
        createItem: function(text, icon, onClick) {
            const item = document.createElement('div');
            Object.assign(item.style, {
                cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '12px 20px',
                background: T.itemBg, border: '1px solid ' + T.itemBorder,
                color: T.text, borderRadius: '14px',
                boxShadow: T.itemShadow,
                backdropFilter: GLASS, WebkitBackdropFilter: GLASS,
                fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap',
                transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease'
            });
            item.innerHTML = itemMarkup(icon, text);
            item.onmouseover = () => {
                item.style.transform = 'translateX(-5px)';
                item.style.background = T.itemBgHover;
                item.style.boxShadow = T.itemShadowHover;
            };
            item.onmouseout = () => {
                item.style.transform = 'translateX(0)';
                item.style.background = T.itemBg;
                item.style.boxShadow = T.itemShadow;
            };
            item.onclick = onClick;
            return item;
        },

        setItemLabel: function(item, icon, text) {
            item.innerHTML = itemMarkup(icon, text);
        },

        // A circular floating action button.
        createFab: function(styles) {
            const fab = document.createElement('div');
            Object.assign(fab.style, Object.assign({
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                borderRadius: '50%', cursor: 'pointer', color: T.fabText,
                backdropFilter: GLASS, WebkitBackdropFilter: GLASS,
                pointerEvents: 'auto'
            }, styles));
            return fab;
        },

        // Full-screen modal backdrop. Clicking it dismisses.
        createOverlay: function(id) {
            const overlay = document.createElement('div');
            overlay.id = id;
            Object.assign(overlay.style, {
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(225, 228, 235, 0.4)', zIndex: 2147483648,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
            });
            overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
            return overlay;
        },

        createPanel: function(fontFamily, sizes) {
            const box = document.createElement('div');
            Object.assign(box.style, Object.assign({
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '20px',
                boxShadow: '0 16px 48px rgba(120, 130, 150, 0.3)',
                backdropFilter: PANEL_GLASS, WebkitBackdropFilter: PANEL_GLASS,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                fontFamily: fontFamily
            }, sizes));
            return box;
        },

        createHeader: function() {
            const header = document.createElement('div');
            Object.assign(header.style, {
                padding: '15px 20px', borderBottom: '1px solid ' + T.line,
                background: T.surface, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
            });
            return header;
        },

        createCloseButton: function(fontSize, onClose) {
            const btn = document.createElement('button');
            btn.innerText = '✕';
            Object.assign(btn.style, {
                background: 'none', border: 'none', color: T.textMuted,
                fontSize: fontSize, cursor: 'pointer'
            });
            btn.onclick = onClose;
            return btn;
        },

        createButton: function(label, styles) {
            const btn = document.createElement('button');
            btn.innerText = label;
            Object.assign(btn.style, Object.assign({
                borderRadius: '8px', cursor: 'pointer'
            }, styles));
            return btn;
        }
    };
})();
