export function getDB(dbName, version, onupgradeneeded) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, version);
        req.onerror = () => {
            reject(req.error?.message);
        };
        req.onupgradeneeded = (e) => {
            onupgradeneeded?.(e.target.result);
        };
        req.onsuccess = (e) => {
            resolve(e.target.result);
        };
    });
}
export function getStoreFromDB(dbName, storeName, options = {}) {
    const onUpgrade = (idb, options) => {
        if (!idb.objectStoreNames.contains(storeName)) {
            idb.createObjectStore(storeName, options);
        }
    };
    const { mode, version, onupgradeneeded = onUpgrade } = options;
    return getDB(dbName, version, onupgradeneeded).then((idb) => idb.transaction(storeName, mode).objectStore(storeName));
}
export function op(makeRequest) {
    return (store) => {
        return new Promise((resolve, reject) => {
            const request = makeRequest(store);
            const transaction = store.transaction;
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => {
                if (Array.isArray(request)) {
                    resolve([request].flat().map((r) => r.result));
                }
                else {
                    resolve(request.result);
                }
            };
        });
    };
}
export function map(entities, fn) {
    const results = [];
    for (const entity of entities) {
        results.push(fn(entity));
    }
    return results;
}
