// The favorites system: quick-pin star, the folder manager modal, and the browser modal.
// Attaches its own floating button and list beside the main menu rather than inside it,
// so it stays reachable on pages where the main menu has no repository actions to show.
window.DC = window.DC || {};

window.DC.initFavorites = function(menu, signal) {
    const ui = window.DC.ui;
    const T = ui.tokens;
    const { platform, context } = menu;
    const { localPath, cloneUrl, isRepoPage } = context;
    const repoId = isRepoPage ? context.repoId : null;

    const FS = window.DC.createStore(platform.storageKey, repoId, platform.savedPath(context));

    // --- Floating star and its list ---

    const starFab = ui.createFab({
        position: 'fixed', right: '20px', bottom: '90px',
        width: '50px', height: '50px', fontSize: '24px',
        background: T.itemBg, border: '1px solid ' + T.itemBorder,
        boxShadow: '0 8px 32px rgba(120, 130, 150, 0.25)', zIndex: T.Z,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });
    starFab.innerHTML = '☆';

    const favList = document.createElement('div');
    Object.assign(favList.style, {
        position: 'fixed', right: '15px', bottom: '85px',
        display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end',
        opacity: '0', transform: 'translateY(10px) scale(0.95)', transformOrigin: 'bottom right',
        transition: 'all 0.2s', pointerEvents: 'none', zIndex: T.Z
    });

    menu.wrapper.insertBefore(favList, menu.wrapper.lastChild);
    menu.wrapper.insertBefore(starFab, menu.wrapper.lastChild);

    let isFavOpen = false;
    let saveItem = null;

    starFab.onclick = () => {
        isFavOpen = !isFavOpen;
        if (!isFavOpen) { closeFavMenu(); return; }
        Object.assign(starFab.style, {
            bottom: '15px', right: '15px', width: '60px', height: '60px', fontSize: '28px',
            background: T.itemBgHover, color: T.gold, borderColor: T.goldBorder
        });
        favList.style.opacity = '1';
        favList.style.transform = 'translateY(0) scale(1)';
        favList.style.pointerEvents = 'auto';
        if (menu.toggleBtn) {
            menu.toggleBtn.style.opacity = '0';
            menu.toggleBtn.style.pointerEvents = 'none';
        }
    };

    function closeFavMenu() {
        isFavOpen = false;
        Object.assign(starFab.style, {
            bottom: '90px', right: '20px', width: '50px', height: '50px', fontSize: '24px',
            background: T.itemBg, borderColor: T.itemBorder, color: T.fabText
        });
        starFab.innerHTML = '☆';
        FS.isPinned().then(updateStarIcon).catch(() => {});

        favList.style.opacity = '0';
        favList.style.transform = 'translateY(10px) scale(0.95)';
        favList.style.pointerEvents = 'none';
        if (menu.toggleBtn) {
            menu.toggleBtn.style.opacity = '1';
            menu.toggleBtn.style.pointerEvents = 'auto';
        }
    }

    // The two floating buttons share a corner, so only one is ever visible.
    const listenerOpts = signal ? { signal: signal } : undefined;
    window.addEventListener(platform.menuOpenedEvent, () => {
        starFab.style.opacity = '0';
        starFab.style.pointerEvents = 'none';
    }, listenerOpts);
    window.addEventListener(platform.menuClosedEvent, () => {
        starFab.style.opacity = '1';
        starFab.style.pointerEvents = 'auto';
    }, listenerOpts);

    // --- Menu items ---

    if (isRepoPage) {
        saveItem = ui.createItem('Save Repo', '☆', async () => {
            if (await FS.isPinned()) {
                await FS.removeAllPins();
                updateStarVisuals(false);
            } else {
                await FS.addPin('root');
                updateStarVisuals(true);
                openManagerModal();
                closeFavMenu();
            }
        });
        favList.appendChild(saveItem);
    }

    favList.prepend(ui.createItem('View Saved', '📂', () => openBrowserModal('root')));

    FS.isPinned().then(pinned => {
        updateStarIcon(pinned);
        updateStarVisuals(pinned);
    }).catch(() => {});

    function updateStarIcon(isPinned) {
        if (isFavOpen || !isRepoPage) return;
        starFab.innerHTML = isPinned ? '⭐' : '☆';
        starFab.style.background = T.itemBg;
        starFab.style.borderColor = isPinned ? T.goldBorder : T.itemBorder;
        starFab.style.color = T.fabText;
    }

    function updateStarVisuals(isPinned) {
        if (!isRepoPage || !saveItem) return;
        ui.setItemLabel(saveItem, isPinned ? '⭐' : '☆', isPinned ? 'Unpin' : 'Save Repo');
        saveItem.style.borderColor = isPinned ? T.goldBorder : T.itemBorder;
        updateStarIcon(isPinned);
    }

    // --- Manager modal: which folders hold this repository ---

    async function openManagerModal() {
        const existing = document.getElementById('dc-fav-modal');
        if (existing) existing.remove();

        const snapshot = await FS.getAll();
        const allFolders = FS.foldersOf(snapshot);
        const selectedSet = new Set(FS.pinsOf(snapshot).map(p => p.parentId));
        allFolders.sort((a, b) => a.name.localeCompare(b.name));

        const overlay = ui.createOverlay('dc-fav-modal');
        const box = ui.createPanel(platform.modalFontFamily, { width: '400px', maxHeight: '80%' });

        const header = ui.createHeader();
        const heading = document.createElement('h3');
        Object.assign(heading.style, { margin: '0', color: T.text });
        heading.textContent = 'Manage Locations';
        header.appendChild(heading);
        header.appendChild(ui.createCloseButton('20px', () => overlay.remove()));
        box.appendChild(header);

        const searchContainer = document.createElement('div');
        Object.assign(searchContainer.style, {
            padding: '10px 20px', borderBottom: '1px solid ' + T.line, background: 'transparent'
        });
        const searchInput = document.createElement('input');
        searchInput.placeholder = 'Search folders...';
        Object.assign(searchInput.style, {
            width: '100%', padding: '8px', borderRadius: '8px',
            border: '1px solid ' + T.lineStrong, background: 'rgba(255, 255, 255, 0.6)',
            color: T.text, boxSizing: 'border-box'
        });
        searchContainer.appendChild(searchInput);
        box.appendChild(searchContainer);

        const filterBar = document.createElement('div');
        Object.assign(filterBar.style, {
            padding: '5px 20px 10px', background: 'transparent',
            borderBottom: '1px solid ' + T.line, overflowX: 'auto', display: 'flex', gap: '5px'
        });
        let activeFilter = 'ALL';
        const renderFilterBar = () => {
            filterBar.innerHTML = '';
            const chars = ['ALL', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
            chars.forEach(char => {
                const active = activeFilter === char;
                const btn = ui.createButton(char, {
                    padding: '2px 8px', borderRadius: '12px',
                    border: '1px solid ' + T.lineStrong,
                    background: active ? T.accent : 'transparent',
                    color: active ? 'white' : T.textMuted,
                    fontSize: '11px', fontWeight: 'bold'
                });
                btn.onclick = () => { activeFilter = char; renderList(); renderFilterBar(); };
                filterBar.appendChild(btn);
            });
        };
        renderFilterBar();
        box.appendChild(filterBar);

        const list = document.createElement('div');
        Object.assign(list.style, { flex: '1', overflowY: 'auto', padding: '10px 0' });
        const renderList = () => {
            list.innerHTML = '';
            const query = searchInput.value.toLowerCase();
            const filtered = allFolders.filter(f => {
                const start = f.name.charAt(0).toUpperCase();
                if (!f.name.toLowerCase().includes(query)) return false;
                if (activeFilter === '0-9') return /[0-9]/.test(start);
                if (activeFilter !== 'ALL') return start === activeFilter;
                return true;
            });
            if (filtered.length === 0) {
                list.innerHTML = '<div style="padding:20px; text-align:center; color:' + T.textMuted
                    + '; font-size:13px;">No folders found.<br>Repo is saved in list.txt</div>';
            }
            filtered.forEach(folder => {
                const row = document.createElement('label');
                Object.assign(row.style, {
                    display: 'flex', alignItems: 'center', padding: '10px 20px', cursor: 'pointer',
                    borderBottom: '1px solid rgba(180, 190, 205, 0.3)', color: T.text
                });
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = selectedSet.has(folder.id);
                Object.assign(checkbox.style, { marginRight: '10px', transform: 'scale(1.2)' });
                checkbox.onchange = () => {
                    if (checkbox.checked) selectedSet.add(folder.id);
                    else selectedSet.delete(folder.id);
                };
                const text = document.createElement('span');
                text.innerText = '📁 ' + folder.name;
                row.appendChild(checkbox);
                row.appendChild(text);
                list.appendChild(row);
            });
        };
        searchInput.oninput = renderList;
        renderList();
        box.appendChild(list);

        const footer = document.createElement('div');
        Object.assign(footer.style, {
            padding: '15px', borderTop: '1px solid ' + T.line, background: T.surface,
            display: 'flex', flexDirection: 'column', gap: '10px'
        });
        const createBtn = ui.createButton('+ Create New Folder', {
            width: '100%', padding: '8px', background: 'transparent',
            border: '1px dashed rgba(160, 170, 185, 0.7)', color: T.textMuted
        });
        createBtn.onclick = async () => {
            const name = prompt('Name:');
            if (!name) return;
            const newId = await FS.createFolder(name);
            allFolders.push({ id: newId, name: name });
            allFolders.sort((a, b) => a.name.localeCompare(b.name));
            selectedSet.add(newId);
            renderList();
        };
        const saveBtn = ui.createButton('Save Changes', {
            width: '100%', padding: '10px', background: T.confirm, border: 'none',
            color: 'white', fontWeight: 'bold', boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)'
        });
        saveBtn.onclick = async () => {
            saveBtn.innerText = 'Saving...';
            const pinned = await FS.setPinFolders([...selectedSet]);
            updateStarVisuals(pinned);
            overlay.remove();
        };
        footer.appendChild(createBtn);
        footer.appendChild(saveBtn);
        box.appendChild(footer);

        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    // --- Browser modal: walk the saved tree ---

    async function openBrowserModal(currentFolderId = 'root') {
        const existing = document.getElementById('dc-fav-modal');
        if (existing) existing.remove();

        const snapshot = await FS.getAll();
        const currentFolder = snapshot.find(i => i.id === currentFolderId);
        const dirItems = FS.dirOf(snapshot, currentFolderId);
        dirItems.sort((a, b) => a.name.localeCompare(b.name));

        const overlay = ui.createOverlay('dc-fav-modal');
        const box = ui.createPanel(platform.modalFontFamily, { width: '80%', height: '80%' });

        const header = ui.createHeader();
        const titleArea = document.createElement('div');
        Object.assign(titleArea.style, { display: 'flex', gap: '10px', alignItems: 'center' });

        if (currentFolderId !== 'root') {
            const backBtn = ui.createButton('⬅ Back', {
                background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid ' + T.lineStrong, color: T.text, padding: '5px 10px'
            });
            backBtn.onclick = () => openBrowserModal(currentFolder ? currentFolder.parentId : 'root');
            titleArea.appendChild(backBtn);
        }

        const titleText = document.createElement('h2');
        Object.assign(titleText.style, { margin: '0', color: T.text });
        titleText.innerText = currentFolderId === 'root'
            ? 'list.txt'
            : (currentFolder ? currentFolder.name : '');
        titleArea.appendChild(titleText);
        header.appendChild(titleArea);
        header.appendChild(ui.createCloseButton('24px', () => overlay.remove()));
        box.appendChild(header);

        const listContainer = document.createElement('div');
        Object.assign(listContainer.style, {
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '8px'
        });

        const renderRow = (item) => {
            const row = document.createElement('div');
            Object.assign(row.style, {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px', background: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid ' + T.line, borderRadius: '10px', color: T.text
            });

            // Built as nodes: item.name comes from a URL and must never be markup.
            const left = document.createElement('div');
            Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '10px' });
            const glyph = document.createElement('span');
            glyph.style.fontSize = '1.2em';
            glyph.textContent = item.type === 'folder' ? '📁' : '📄';
            const label = document.createElement('div');
            label.style.fontWeight = '600';
            label.textContent = item.name;
            left.appendChild(glyph);
            left.appendChild(label);

            if (item.type === 'folder') {
                row.style.cursor = 'pointer';
                row.onclick = (e) => { if (!e.target.closest('button')) openBrowserModal(item.id); };
            }

            const actions = document.createElement('div');
            Object.assign(actions.style, { display: 'flex', gap: '8px' });

            if (item.type === 'pin') {
                const devBtn = ui.createButton('🐳', {
                    padding: '5px 10px', background: T.itemBg,
                    border: '1px solid ' + T.lineStrong, color: T.text
                });
                devBtn.onclick = () => {
                    window.location.href = 'vscode://ms-vscode-remote.remote-containers/cloneInVolume?url='
                        + encodeURIComponent(item.url);
                };
                actions.appendChild(devBtn);

                const goBtn = ui.createButton('➜', {
                    padding: '5px 10px', background: T.accent, border: 'none', color: 'white'
                });
                goBtn.onclick = () => { window.location.href = item.url; };
                actions.appendChild(goBtn);

                const moveBtn = ui.createButton('⇄', {
                    padding: '5px 10px', background: 'rgba(170, 178, 192, 0.85)',
                    border: 'none', color: 'white'
                });
                moveBtn.onclick = async () => {
                    const allFolders = FS.foldersOf(await FS.getAll()).filter(i => i.id !== item.id);
                    let folderList = "Root (type 'root')\n";
                    allFolders.forEach(f => { folderList += f.name + " (type '" + f.name + "')\n"; });
                    const destName = prompt('Move \'' + item.name + '\' to:\n' + folderList, 'root');
                    if (!destName) return;
                    let targetId = 'root';
                    if (destName !== 'root') {
                        const target = allFolders.find(f => f.name === destName);
                        if (!target) return alert('Folder not found');
                        targetId = target.id;
                    }
                    await FS.moveItem(item, targetId);
                    openBrowserModal(currentFolderId);
                };
                actions.appendChild(moveBtn);
            }

            const delBtn = ui.createButton('🗑', {
                padding: '5px 10px', background: T.danger, border: 'none', color: 'white'
            });
            delBtn.onclick = async () => {
                if (!confirm('Delete ' + item.name + '?')) return;
                await FS.deleteItem(item);
                openBrowserModal(currentFolderId);
                if (repoId && item.id === repoId) updateStarVisuals(await FS.isPinned());
            };
            actions.appendChild(delBtn);

            row.appendChild(left);
            row.appendChild(actions);
            listContainer.appendChild(row);
        };

        dirItems.filter(i => i.type === 'folder').forEach(renderRow);

        // Pins are grouped under a heading for their owner.
        let lastOwner = '';
        dirItems.filter(i => i.type === 'pin').forEach(item => {
            const currentOwner = item.name.split('/')[0];
            if (currentOwner !== lastOwner) {
                const sep = document.createElement('div');
                sep.innerText = currentOwner;
                Object.assign(sep.style, {
                    padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', color: T.textMuted,
                    borderBottom: '1px solid ' + T.line, marginTop: '10px'
                });
                listContainer.appendChild(sep);
                lastOwner = currentOwner;
            }
            renderRow(item);
        });

        if (listContainer.children.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center; color:' + T.textMuted
                + '; margin-top:20px;">Empty</div>';
        }

        box.appendChild(listContainer);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }
};
