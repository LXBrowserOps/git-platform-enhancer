(function() {
    // Run everywhere (Dashboard, etc), so check wrapper existence
    if (!window.DC_GitHub || !window.DC_GitHub.wrapper) return;

    const { localPath, cloneUrl, org, repo, isRepoPage } = window.DC_GitHub.context;
    const repoId = isRepoPage ? `${org}/${repo}` : null; // Null if not on a repo page
    const STORAGE_KEY = 'gh_favorites';

    // --- 1. FS ENGINE ---
    const FS = {
        getAll: () => new Promise(resolve => { try { chrome.storage.local.get([STORAGE_KEY], res => { if (chrome.runtime.lastError) resolve([]); else resolve(res[STORAGE_KEY] || []); }); } catch (e) { resolve([]); } }),
        saveAll: (items) => new Promise(resolve => { try { chrome.storage.local.set({ [STORAGE_KEY]: items }, resolve); } catch (e) { resolve(); } }),
        getMyPins: async () => { if(!repoId) return []; const items = await FS.getAll(); return items.filter(i => i.id === repoId && i.type === 'pin'); },
        isPinned: async () => { if(!repoId) return false; const pins = await FS.getMyPins(); return pins.length > 0; },
        addPin: async (parentId = 'root') => {
            if(!repoId) return;
            let items = await FS.getAll();
            const exists = items.some(i => i.id === repoId && i.type === 'pin' && i.parentId === parentId);
            if (exists) return;
            const savedPath = `github/favorite/${repo}`;
            items.push({ id: repoId, type: 'pin', parentId: parentId, name: repoId, path: savedPath, url: window.location.href, timestamp: Date.now() });
            await FS.saveAll(items);
        },
        removePinFromFolder: async (parentId) => {
            if(!repoId) return;
            let items = await FS.getAll();
            items = items.filter(i => !(i.id === repoId && i.type === 'pin' && i.parentId === parentId));
            await FS.saveAll(items);
        },
        removeAllPins: async () => {
            if(!repoId) return;
            let items = await FS.getAll();
            items = items.filter(i => !(i.id === repoId && i.type === 'pin'));
            await FS.saveAll(items);
        },
        createFolder: async (name) => {
            const items = await FS.getAll();
            const id = 'folder_' + Date.now();
            items.push({ id: id, type: 'folder', name: name, parentId: 'root', timestamp: Date.now() });
            await FS.saveAll(items);
            return id;
        },
        getAllFolders: async () => { const items = await FS.getAll(); return items.filter(i => i.type === 'folder'); },
        getDir: async (parentId = 'root') => { const items = await FS.getAll(); return items.filter(i => i.parentId === parentId); },
        deleteItem: async (itemId) => { let items = await FS.getAll(); items = items.filter(i => i.id !== itemId && i.parentId !== itemId); await FS.saveAll(items); }
    };

    // --- UI ---
    const starFab = document.createElement('div');
    starFab.innerHTML = '☆';
    Object.assign(starFab.style, {
        position: 'fixed', right: '20px', bottom: '90px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
        fontSize: '24px', color: '#3a3f47',
        background: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.65)',
        boxShadow: '0 8px 32px rgba(120, 130, 150, 0.25)', zIndex: '2147483647',
        backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'auto'
    });

    const favList = document.createElement('div');
    Object.assign(favList.style, {
        position: 'fixed', right: '15px', bottom: '85px', 
        display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end',
        opacity: '0', transform: 'translateY(10px) scale(0.95)', transformOrigin: 'bottom right',
        transition: 'all 0.2s', pointerEvents: 'none', zIndex: '2147483647'
    });

    window.DC_GitHub.wrapper.insertBefore(favList, window.DC_GitHub.wrapper.lastChild);
    window.DC_GitHub.wrapper.insertBefore(starFab, window.DC_GitHub.wrapper.lastChild);

    let isFavOpen = false;

    starFab.onclick = () => {
        isFavOpen = !isFavOpen;
        if (isFavOpen) {
            starFab.style.bottom = '15px'; starFab.style.right = '15px';
            starFab.style.width = '60px'; starFab.style.height = '60px'; starFab.style.fontSize = '28px';
            starFab.style.background = 'rgba(255, 255, 255, 0.85)'; starFab.style.color = '#b8860b'; starFab.style.borderColor = 'rgba(212, 175, 55, 0.6)';
            favList.style.opacity = '1'; favList.style.transform = 'translateY(0) scale(1)'; favList.style.pointerEvents = 'auto';
            if(window.DC_GitHub.toggleBtn) { window.DC_GitHub.toggleBtn.style.opacity = '0'; window.DC_GitHub.toggleBtn.style.pointerEvents = 'none'; }
        } else { closeFavMenu(); }
    };

    function closeFavMenu() {
        isFavOpen = false;
        starFab.style.bottom = '90px'; starFab.style.right = '20px';
        starFab.style.width = '50px'; starFab.style.height = '50px'; starFab.style.fontSize = '24px';
        
        starFab.style.background = 'rgba(255, 255, 255, 0.55)'; starFab.style.borderColor = 'rgba(255, 255, 255, 0.65)'; starFab.style.color = '#3a3f47'; starFab.innerHTML = '☆';
        FS.isPinned().then(pinned => updateStarIcon(pinned)).catch(()=>{});

        favList.style.opacity = '0'; favList.style.transform = 'translateY(10px) scale(0.95)'; favList.style.pointerEvents = 'none';
        if(window.DC_GitHub.toggleBtn) { window.DC_GitHub.toggleBtn.style.opacity = '1'; window.DC_GitHub.toggleBtn.style.pointerEvents = 'auto'; }
    }

    window.addEventListener('DC_MenuOpened', () => { starFab.style.opacity = '0'; starFab.style.pointerEvents = 'none'; });
    window.addEventListener('DC_MenuClosed', () => { starFab.style.opacity = '1'; starFab.style.pointerEvents = 'auto'; });

    // --- CONDITIONAL ITEMS ---
    
    // Only show "Save Repo" if we are actually on a repo page
    if (isRepoPage) {
        const saveItem = window.DC_GitHub.createItem('Save Repo', '☆', async () => {
            const pinned = await FS.isPinned();
            if (pinned) { await FS.removeAllPins(); updateStarVisuals(false); } 
            else { await FS.addPin('root'); updateStarVisuals(true); openManagerModal(); closeFavMenu(); }
        });
        favList.appendChild(saveItem);
        // Expose to global scope for update helper access? 
        // Better: store reference in closure
        window.DC_GitHub.saveItemRef = saveItem;
    }

    const viewItem = window.DC_GitHub.createItem('View Saved', '📂', () => openBrowserModal('root'));
    favList.prepend(viewItem); // View Saved always at top

    // Init
    FS.isPinned().then(pinned => { updateStarIcon(pinned); updateStarVisuals(pinned); }).catch(()=>{});

    function updateStarIcon(isPinned) {
        if (!isFavOpen && isRepoPage) {
            if (isPinned) { starFab.innerHTML = '⭐'; starFab.style.background = 'rgba(255, 255, 255, 0.55)'; starFab.style.borderColor = 'rgba(212, 175, 55, 0.6)'; starFab.style.color = '#3a3f47'; }
            else { starFab.innerHTML = '☆'; starFab.style.background = 'rgba(255, 255, 255, 0.55)'; starFab.style.borderColor = 'rgba(255, 255, 255, 0.65)'; starFab.style.color = '#3a3f47'; }
        }
    }

    function updateStarVisuals(isPinned) {
        if (!isRepoPage || !window.DC_GitHub.saveItemRef) return;
        const saveItem = window.DC_GitHub.saveItemRef;
        if (isPinned) { saveItem.innerHTML = '<span style="margin-right: 10px; font-size: 1.3em;">⭐</span>Unpin'; saveItem.style.borderColor = 'rgba(212, 175, 55, 0.6)'; }
        else { saveItem.innerHTML = '<span style="margin-right: 10px; font-size: 1.3em;">☆</span>Save Repo'; saveItem.style.borderColor = 'rgba(255, 255, 255, 0.65)'; }
        updateStarIcon(isPinned);
    }

    // --- MODALS (Manager & Browser) ---
    // (Include full openManagerModal and openBrowserModal logic from previous response)
    // NOTE: Ensure openManagerModal refreshes UI using updateStarVisuals
    
    async function openManagerModal() {
        const existing = document.getElementById('dc-fav-modal'); if (existing) existing.remove();
        const allFolders = await FS.getAllFolders();
        const myPins = await FS.getMyPins();
        const selectedSet = new Set(myPins.map(p => p.parentId));
        allFolders.sort((a, b) => a.name.localeCompare(b.name));

        const overlay = document.createElement('div'); overlay.id = 'dc-fav-modal';
        Object.assign(overlay.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(225, 228, 235, 0.4)', zIndex: 2147483648, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' });
        const box = document.createElement('div');
        Object.assign(box.style, { width: '400px', maxHeight: '80%', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '20px', boxShadow: '0 16px 48px rgba(120, 130, 150, 0.3)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'sans-serif' });
        const header = document.createElement('div'); header.innerHTML = '<h3 style="margin:0; color:#2b2f36;">Manage Locations</h3>';
        Object.assign(header.style, { padding: '15px 20px', borderBottom: '1px solid rgba(180, 190, 205, 0.4)', background: 'rgba(255, 255, 255, 0.45)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
        const closeBtn = document.createElement('button'); closeBtn.innerText = '✕';
        Object.assign(closeBtn.style, { background: 'none', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer' });
        closeBtn.onclick = () => overlay.remove(); header.appendChild(closeBtn); box.appendChild(header);

        const searchContainer = document.createElement('div'); Object.assign(searchContainer.style, { padding: '10px 20px', borderBottom: '1px solid rgba(180, 190, 205, 0.4)', background: 'transparent' });
        const searchInput = document.createElement('input'); searchInput.placeholder = 'Search folders...';
        Object.assign(searchInput.style, { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(180, 190, 205, 0.5)', background: 'rgba(255, 255, 255, 0.6)', color: '#2b2f36', boxSizing: 'border-box' });
        searchContainer.appendChild(searchInput); box.appendChild(searchContainer);

        const filterBar = document.createElement('div'); Object.assign(filterBar.style, { padding: '5px 20px 10px', background: 'transparent', borderBottom: '1px solid rgba(180, 190, 205, 0.4)', overflowX: 'auto', display: 'flex', gap: '5px' });
        let activeFilter = 'ALL';
        const renderFilterBar = () => {
            filterBar.innerHTML = ''; const chars = ['ALL', '0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
            chars.forEach(char => {
                const btn = document.createElement('button'); btn.innerText = char;
                Object.assign(btn.style, { padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(180, 190, 205, 0.5)', background: activeFilter === char ? 'linear-gradient(135deg, #8a94a6, #aab2c0)' : 'transparent', color: activeFilter === char ? 'white' : '#6b7280', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' });
                btn.onclick = () => { activeFilter = char; renderList(); renderFilterBar(); }; filterBar.appendChild(btn);
            });
        }; renderFilterBar(); box.appendChild(filterBar);

        const list = document.createElement('div'); Object.assign(list.style, { flex: '1', overflowY: 'auto', padding: '10px 0' });
        const renderList = () => {
            list.innerHTML = ''; const query = searchInput.value.toLowerCase();
            const filtered = allFolders.filter(f => {
                const name = f.name; const start = name.charAt(0).toUpperCase();
                if (!name.toLowerCase().includes(query)) return false;
                if (activeFilter === '0-9') return /[0-9]/.test(start);
                if (activeFilter !== 'ALL') return start === activeFilter;
                return true;
            });
            if (filtered.length === 0) list.innerHTML = '<div style="padding:20px; text-align:center; color:#6b7280; font-size:13px;">No folders found.<br>Repo is saved in list.txt</div>';
            filtered.forEach(folder => {
                const row = document.createElement('label');
                Object.assign(row.style, { display: 'flex', alignItems: 'center', padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(180, 190, 205, 0.3)', color: '#2b2f36' });
                const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
                checkbox.checked = selectedSet.has(folder.id);
                Object.assign(checkbox.style, { marginRight: '10px', transform: 'scale(1.2)' });
                checkbox.onchange = () => { if (checkbox.checked) selectedSet.add(folder.id); else selectedSet.delete(folder.id); };
                const text = document.createElement('span'); text.innerText = '📁 ' + folder.name;
                row.appendChild(checkbox); row.appendChild(text); list.appendChild(row);
            });
        }; searchInput.oninput = renderList; renderList(); box.appendChild(list);

        const footer = document.createElement('div'); Object.assign(footer.style, { padding: '15px', borderTop: '1px solid rgba(180, 190, 205, 0.4)', background: 'rgba(255, 255, 255, 0.45)', display:'flex', flexDirection:'column', gap:'10px' });
        const createBtn = document.createElement('button'); createBtn.innerText = '+ Create New Folder';
        Object.assign(createBtn.style, { width: '100%', padding: '8px', background: 'transparent', border: '1px dashed rgba(160, 170, 185, 0.7)', borderRadius: '8px', color: '#6b7280', cursor: 'pointer' });
        createBtn.onclick = async () => { const name = prompt("Name:"); if (name) { const newId = await FS.createFolder(name); allFolders.push({id:newId, name:name}); allFolders.sort((a,b)=>a.name.localeCompare(b.name)); selectedSet.add(newId); renderList(); } };
        const saveBtn = document.createElement('button'); saveBtn.innerText = 'Save Changes';
        Object.assign(saveBtn.style, { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #34c759, #28a745)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)' });
        saveBtn.onclick = async () => {
            saveBtn.innerText = 'Saving...';
            for (let folder of allFolders) {
                const wantsPin = selectedSet.has(folder.id); const hasPin = myPins.some(p => p.parentId === folder.id);
                if (wantsPin && !hasPin) await FS.addPin(folder.id); else if (!wantsPin && hasPin) await FS.removePinFromFolder(folder.id);
            }
            updateStarVisuals(await FS.isPinned()); overlay.remove();
        };
        footer.appendChild(createBtn); footer.appendChild(saveBtn); box.appendChild(footer); overlay.appendChild(box); document.body.appendChild(overlay); overlay.onclick = (e) => { if(e.target===overlay) overlay.remove(); };
    }

    async function openBrowserModal(currentFolderId = 'root') {
        const existing = document.getElementById('dc-fav-modal'); if (existing) existing.remove();
        const dirItems = await FS.getDir(currentFolderId);
        dirItems.sort((a, b) => a.name.localeCompare(b.name));
        const overlay = document.createElement('div'); overlay.id = 'dc-fav-modal';
        Object.assign(overlay.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(225, 228, 235, 0.4)', zIndex: 2147483648, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' });
        const box = document.createElement('div');
        Object.assign(box.style, { width: '80%', height: '80%', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '20px', boxShadow: '0 16px 48px rgba(120, 130, 150, 0.3)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'sans-serif' });
        const header = document.createElement('div');
        Object.assign(header.style, { padding: '15px 20px', borderBottom: '1px solid rgba(180, 190, 205, 0.4)', background: 'rgba(255, 255, 255, 0.45)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
        const titleArea = document.createElement('div'); titleArea.style.display = 'flex'; titleArea.style.gap = '10px'; titleArea.style.alignItems = 'center';
        if (currentFolderId !== 'root') {
            const backBtn = document.createElement('button'); backBtn.innerText = '⬅ Back';
            Object.assign(backBtn.style, { background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(180, 190, 205, 0.5)', color: '#2b2f36', borderRadius: '8px', cursor: 'pointer', padding: '5px 10px' });
            FS.getAll().then(all => { const current = all.find(i => i.id === currentFolderId); backBtn.onclick = () => openBrowserModal(current ? current.parentId : 'root'); });
            titleArea.appendChild(backBtn);
        }
        const titleText = document.createElement('h2'); 
        if (currentFolderId === 'root') titleText.innerText = 'list.txt';
        else FS.getAll().then(all => { const f = all.find(i=>i.id===currentFolderId); if(f) titleText.innerText = f.name; });
        titleText.style.margin = '0'; titleText.style.color = '#2b2f36';
        titleArea.appendChild(titleText); header.appendChild(titleArea);
        const closeBtn = document.createElement('button'); closeBtn.innerText = '✕';
        Object.assign(closeBtn.style, { background: 'none', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' });
        closeBtn.onclick = () => overlay.remove(); header.appendChild(closeBtn); box.appendChild(header);
        const listContainer = document.createElement('div'); Object.assign(listContainer.style, { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' });
        
        const renderRow = (item) => {
            const row = document.createElement('div');
            Object.assign(row.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(180, 190, 205, 0.4)', borderRadius: '10px', color: '#2b2f36' });
            const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems = 'center'; left.style.gap = '10px';
            left.innerHTML = `<span style="font-size:1.2em">${item.type === 'folder' ? '📁' : '📄'}</span> <div style="font-weight:600;">${item.name}</div>`;
            if (item.type === 'folder') { row.style.cursor = 'pointer'; row.onclick = (e) => { if (!e.target.closest('button')) openBrowserModal(item.id); }; }
            const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px';
            if (item.type === 'pin') {
                const devBtn = document.createElement('button'); devBtn.innerText = '🐳';
                Object.assign(devBtn.style, { padding: '5px 10px', background: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(180, 190, 205, 0.5)', borderRadius: '8px', color: '#2b2f36', cursor: 'pointer' });
                devBtn.onclick = () => { const uri = `vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=${encodeURIComponent(item.url)}`; window.location.href = uri; };
                actions.appendChild(devBtn);
                const goBtn = document.createElement('button'); goBtn.innerText = '➜';
                Object.assign(goBtn.style, { padding: '5px 10px', background: 'linear-gradient(135deg, #8a94a6, #aab2c0)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' });
                goBtn.onclick = () => window.location.href = item.url;
                actions.appendChild(goBtn);
                const moveBtn = document.createElement('button'); moveBtn.innerText = '⇄';
                Object.assign(moveBtn.style, { padding: '5px 10px', background: 'rgba(170, 178, 192, 0.85)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' });
                moveBtn.onclick = async () => { const allFolders = (await FS.getAll()).filter(i => i.type === 'folder' && i.id !== item.id); let folderList = "Root (type 'root')\n"; allFolders.forEach(f => folderList += `${f.name} (type '${f.name}')\n`); const destName = prompt(`Move '${item.name}' to:\n${folderList}`, 'root'); if (destName) { let targetId = 'root'; if (destName !== 'root') { const target = allFolders.find(f => f.name === destName); if (target) targetId = target.id; else return alert("Folder not found"); } await FS.moveItem(item.id, targetId); openBrowserModal(currentFolderId); } };
                actions.appendChild(moveBtn);
            }
            const delBtn = document.createElement('button'); delBtn.innerText = '🗑';
            Object.assign(delBtn.style, { padding: '5px 10px', background: 'linear-gradient(135deg, #ff6b6b, #e04a4a)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' });
            delBtn.onclick = async () => { if(confirm(`Delete ${item.name}?`)) { await FS.deleteItem(item.id); openBrowserModal(currentFolderId); if(repoId && item.id === repoId) updateStarVisuals(await FS.isPinned()); }};
            actions.appendChild(delBtn);
            row.appendChild(left); row.appendChild(actions); listContainer.appendChild(row);
        };

        dirItems.filter(i => i.type === 'folder').forEach(renderRow);
        const pins = dirItems.filter(i => i.type === 'pin');
        let lastOrg = '';
        pins.forEach(item => {
            const currentOrg = item.name.split('/')[0];
            if (currentOrg !== lastOrg) { const sep = document.createElement('div'); sep.innerText = currentOrg; Object.assign(sep.style, { padding: '8px 4px', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', borderBottom: '1px solid rgba(180, 190, 205, 0.4)', marginTop: '10px' }); listContainer.appendChild(sep); lastOrg = currentOrg; }
            renderRow(item);
        });
        if(listContainer.children.length === 0) listContainer.innerHTML = '<div style="text-align:center; color:#6b7280; margin-top:20px;">Empty</div>';
        box.appendChild(listContainer); overlay.appendChild(box); document.body.appendChild(overlay); overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    }
})();