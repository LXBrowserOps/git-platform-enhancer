// Favorites storage engine.
//
// One flat array per platform under a single chrome.storage.local key. The folder tree is
// encoded by reference: every record names its parent through `parentId`, and 'root' is
// the top level. Two record types share the array, distinguished by `type`:
// 'folder' and 'pin'. The schema is documented in wiki/reference/favorites-storage.md
// and must not change without a migration.
//
// A pin is identified by (id, type, parentId), not by `id` alone: the same repository may
// be pinned into several folders, which gives several records the same `id`.
window.DC = window.DC || {};

// Firefox exposes the same surface under `browser`. Resolved once, not at every call.
window.DC.storageArea = (function() {
    try {
        if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) return browser.storage.local;
    } catch (e) { /* `browser` is not defined in this world */ }
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) return chrome.storage.local;
    } catch (e) { /* no extension context */ }
    return null;
})();

// storageKey  the storage key for this platform
// repoId      identifier of the repository on the current page, or null when not on one
// savedPath   suggested local path recorded on a new pin
window.DC.createStore = function(storageKey, repoId, savedPath) {
    const area = window.DC.storageArea;

    const samePin = (a, b) => a.type === 'pin' && b.type === 'pin'
        && a.id === b.id && a.parentId === b.parentId;

    const FS = {
        getAll: () => new Promise(resolve => {
            if (!area) return resolve([]);
            try {
                area.get([storageKey], res => {
                    // An extension reload invalidates the context of an already-open tab.
                    if (chrome.runtime && chrome.runtime.lastError) return resolve([]);
                    resolve((res && res[storageKey]) || []);
                });
            } catch (e) { resolve([]); }
        }),

        saveAll: (items) => new Promise(resolve => {
            if (!area) return resolve();
            try { area.set({ [storageKey]: items }, () => resolve()); } catch (e) { resolve(); }
        }),

        // --- Derivations over an already-loaded snapshot, so a caller that needs several
        // answers pays for one read instead of one per question. ---

        pinsOf: (items) => repoId ? items.filter(i => i.id === repoId && i.type === 'pin') : [],
        foldersOf: (items) => items.filter(i => i.type === 'folder'),
        dirOf: (items, parentId) => items.filter(i => i.parentId === parentId),

        getMyPins: async () => FS.pinsOf(await FS.getAll()),
        isPinned: async () => FS.pinsOf(await FS.getAll()).length > 0,
        getAllFolders: async () => FS.foldersOf(await FS.getAll()),
        getDir: async (parentId = 'root') => FS.dirOf(await FS.getAll(), parentId),

        addPin: async (parentId = 'root') => {
            if (!repoId) return;
            const items = await FS.getAll();
            if (items.some(i => i.id === repoId && i.type === 'pin' && i.parentId === parentId)) return;
            items.push({
                id: repoId, type: 'pin', parentId: parentId, name: repoId,
                path: savedPath, url: window.location.href, timestamp: Date.now()
            });
            await FS.saveAll(items);
        },

        removePinFromFolder: async (parentId) => {
            if (!repoId) return;
            const items = await FS.getAll();
            await FS.saveAll(items.filter(i => !(i.id === repoId && i.type === 'pin' && i.parentId === parentId)));
        },

        removeAllPins: async () => {
            if (!repoId) return;
            const items = await FS.getAll();
            await FS.saveAll(items.filter(i => !(i.id === repoId && i.type === 'pin')));
        },

        // Reconcile this repository's pins against a chosen set of folders in one
        // read and one write, rather than a read and a write per folder.
        setPinFolders: async (folderIds) => {
            if (!repoId) return false;
            const wanted = new Set(folderIds);
            const items = await FS.getAll();
            const kept = items.filter(i => !(i.id === repoId && i.type === 'pin' && !wanted.has(i.parentId)));
            const have = new Set(kept.filter(i => i.id === repoId && i.type === 'pin').map(i => i.parentId));
            wanted.forEach(parentId => {
                if (have.has(parentId)) return;
                kept.push({
                    id: repoId, type: 'pin', parentId: parentId, name: repoId,
                    path: savedPath, url: window.location.href, timestamp: Date.now()
                });
            });
            await FS.saveAll(kept);
            return kept.some(i => i.id === repoId && i.type === 'pin');
        },

        createFolder: async (name) => {
            const items = await FS.getAll();
            const id = 'folder_' + Date.now();
            items.push({ id: id, type: 'folder', name: name, parentId: 'root', timestamp: Date.now() });
            await FS.saveAll(items);
            return id;
        },

        // Deletes exactly the record passed in. A folder takes everything beneath it,
        // to any depth, so nothing is orphaned; a pin takes only itself, leaving the
        // same repository pinned elsewhere untouched.
        deleteItem: async (item) => {
            const items = await FS.getAll();
            if (item.type !== 'folder') {
                await FS.saveAll(items.filter(i => !samePin(i, item)));
                return;
            }
            const doomed = new Set([item.id]);
            let grew = true;
            while (grew) {
                grew = false;
                items.forEach(i => {
                    if (!doomed.has(i.id) && doomed.has(i.parentId) && i.type === 'folder') {
                        doomed.add(i.id); grew = true;
                    }
                });
            }
            await FS.saveAll(items.filter(i => !doomed.has(i.id) && !doomed.has(i.parentId)));
        },

        // Moves one record to another folder. Moving a pin onto a folder that already
        // holds this repository merges rather than creating a duplicate.
        moveItem: async (item, targetId) => {
            const items = await FS.getAll();
            if (item.type === 'pin') {
                const already = items.some(i => i.type === 'pin' && i.id === item.id && i.parentId === targetId);
                const next = already
                    ? items.filter(i => !samePin(i, item))
                    : items.map(i => samePin(i, item) ? Object.assign({}, i, { parentId: targetId }) : i);
                await FS.saveAll(next);
                return;
            }
            if (item.id === targetId) return;
            await FS.saveAll(items.map(i => i.id === item.id ? Object.assign({}, i, { parentId: targetId }) : i));
        }
    };

    return FS;
};
