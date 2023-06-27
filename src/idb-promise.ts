export function getDB(dbName: string, version?: number, onupgradeneeded?: (req: IDBDatabase) => void) {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(dbName, version);
        req.onerror = () => {
            reject(req.error?.message);
        };
        req.onupgradeneeded = (e) => {
            onupgradeneeded?.((e.target as IDBOpenDBRequest).result);
        };
        req.onsuccess = (e) => {
            resolve((e.target as IDBOpenDBRequest).result);
        };
    });
}

export type GetStoreFromDBOptions = {
    mode?: IDBTransactionMode;
    version?: number;
    onupgradeneeded?: (idb: IDBDatabase, options?: IDBObjectStoreParameters) => void;
};
export function getStoreFromDB(
    dbName: string,
    storeName: string,
    options = {} as GetStoreFromDBOptions
): Promise<IDBObjectStore> {
    const onUpgrade = (idb: IDBDatabase, options?: IDBObjectStoreParameters) => {
        if (!idb.objectStoreNames.contains(storeName)) {
            idb.createObjectStore(storeName, options);
        }
    };
    const { mode, version, onupgradeneeded = onUpgrade } = options;
    return getDB(dbName, version, onupgradeneeded).then((idb) =>
        idb.transaction(storeName, mode).objectStore(storeName)
    );
}

export type MapStore<T> = (store: IDBObjectStore) => T;

export function op<T>(makeRequest: MapStore<IDBRequest<T>>): MapStore<Promise<T>>;
export function op<T>(makeRequest: MapStore<IDBRequest<T>[]>): MapStore<Promise<T[]>>;
export function op<T>(makeRequest: MapStore<IDBRequest<T>> | MapStore<IDBRequest<T>[]>) {
    return (store: IDBObjectStore) => {
        return new Promise<T | T[]>((resolve, reject) => {
            const request = makeRequest(store);
            const transaction = store.transaction;
            transaction.onerror = () => reject(transaction.error);
            transaction.oncomplete = () => {
                if (Array.isArray(request)) {
                    resolve([request].flat().map((r) => r.result) as T[]);
                } else {
                    resolve(request.result as T);
                }
            };
        });
    };
}

type Entities<T> = Array<T> | Array<T> | IterableIterator<T>;
export function map<T, U>(entities: Entities<T>, fn: (entity: T) => U): U[] {
    const results: U[] = [];
    for (const entity of entities) {
        results.push(fn(entity));
    }
    return results;
}
