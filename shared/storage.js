// Favorites storage engine.
//
// One flat array per platform under a single chrome.storage.local key. The folder tree is
// encoded by reference: every record names its parent through `parentId`, and 'root' is
// the top level. Two record types share the array, distinguished by `type`:
// 'folder' and 'pin'. The schema is documented in wiki/reference/favorites-storage.md
// and must not change without a migration.
window.DC = window.DC || {};

// storageKey  the chrome.storage.local key for this platform
// repoId      identifier of the repository on the current page, or null when not on one
// savedPath   suggested local path recorded on a new pin
window.DC.createStore = function(storageKey, repoId, savedPath) {
    const FS = {
        getAll: () => new Promise(resolve => {
            try {
                chrome.storage.local.get([storageKey], res => {
                    // An extension reload invalidates the context of an already-open tab.
                    if (chrome.runtime.lastError) resolve([]);
                    else resolve(res[storageKey] || []);
                });
            } catch (e) { resolve([]); }
        }),

        saveAll: (items) => new Promise(resolve => {
            try { chrome.storage.local.set({ [storageKey]: items }, resolve); } catch (e) { resolve(); }
        }),

        getMyPins: async () => {
            if (!repoId) return [];
            const items = await FS.getAll();
            return items.filter(i => i.id === repoId && i.type === 'pin');
        },

        isPinned: async () => {
            if (!repoId) return false;
            const pins = await FS.getMyPins();
            return pins.length > 0;
        },

        addPin: async (parentId = 'root') => {
            if (!repoId) return;
            const items = await FS.getAll();
            const exists = items.some(i => i.id === repoId && i.type === 'pin' && i.parentId === parentId);
            if (exists) return;
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

        createFolder: async (name) => {
            const items = await FS.getAll();
            const id = 'folder_' + Date.now();
            items.push({ id: id, type: 'folder', name: name, parentId: 'root', timestamp: Date.now() });
            await FS.saveAll(items);
            return id;
        },

        getAllFolders: async () => (await FS.getAll()).filter(i => i.type === 'folder'),

        getDir: async (parentId = 'root') => (await FS.getAll()).filter(i => i.parentId === parentId),

        deleteItem: async (itemId) => {
            const items = await FS.getAll();
            await FS.saveAll(items.filter(i => i.id !== itemId && i.parentId !== itemId));
        }
    };

    return FS;
};
