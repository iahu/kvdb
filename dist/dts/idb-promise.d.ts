export declare function getDB(dbName: string, version?: number, onupgradeneeded?: (req: IDBDatabase) => void): Promise<IDBDatabase>;
export type GetStoreFromDBOptions = {
    mode?: IDBTransactionMode;
    version?: number;
    onupgradeneeded?: (idb: IDBDatabase, options?: IDBObjectStoreParameters) => void;
};
export declare function getStoreFromDB(dbName: string, storeName: string, options?: GetStoreFromDBOptions): Promise<IDBObjectStore>;
export type MapStore<T> = (store: IDBObjectStore) => T;
export declare function op<T>(makeRequest: MapStore<IDBRequest<T>>): MapStore<Promise<T>>;
export declare function op<T>(makeRequest: MapStore<IDBRequest<T>[]>): MapStore<Promise<T[]>>;
type Entites<T> = Array<T> | Array<T> | IterableIterator<T>;
export declare function map<T, U>(entities: Entites<T>, fn: (entity: T) => U): U[];
export {};
