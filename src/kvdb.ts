import { getStoreFromDB, map, op } from './idb-promise';

export const DB_NAME = 'keyvalue_database';
export const STORE_NAME = 'keyvalue_store';

function getStore(mode?: IDBTransactionMode, version?: number) {
    return getStoreFromDB(DB_NAME, STORE_NAME, { version, mode });
}

function get<T>(key: IDBValidKey): Promise<T> {
    return getStore('readonly').then(op((store) => store.get(key)));
}

function add<T>(key: IDBValidKey, value: T): Promise<IDBValidKey> {
    return getStore('readwrite').then(op((store) => store.add(value, key)));
}

function set<T>(key: IDBValidKey, value: T): Promise<IDBValidKey> {
    return getStore('readwrite').then(op((store) => store.put(value, key)));
}

function remove(query: IDBValidKey | IDBKeyRange): Promise<void | void[]> {
    return getStore('readwrite').then(op((store) => store.delete(query)));
}

function clear(): Promise<undefined> {
    return getStore('readwrite').then(op((store) => store.clear()));
}

function count(): Promise<number> {
    return getStore('readonly').then(op((store) => store.count()));
}

function getKey(key: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined> {
    return getStore('readonly').then(op((store) => store.getKey(key)));
}

function getAllKeys(query?: IDBValidKey | IDBKeyRange | undefined | null, count?: number): Promise<IDBValidKey[]> {
    return getStore('readonly').then(op((store) => store.getAllKeys(query, count)));
}

function getAllValues<T = any>(query?: IDBValidKey | IDBKeyRange | undefined | null, count?: number): Promise<T[]> {
    return getStore('readonly').then(op((store) => store.getAll(query, count)));
}

export type IterableEntities<T> = Array<T> | IterableIterator<T>;

function addMany(entities: IterableEntities<[IDBValidKey, any] | IDBValidKey[]>): Promise<IDBValidKey[]> {
    return getStore('readwrite').then(op((store) => map(entities, ([key, value]) => store.add(value, key))));
}

function setMany(entities: IterableEntities<[IDBValidKey, any] | IDBValidKey[]>): Promise<IDBValidKey[]> {
    return getStore('readwrite').then(op((store) => map(entities, ([key, value]) => store.put(value, key))));
}

function getMany<T = any>(entities: IterableEntities<IDBValidKey>): Promise<T[]> {
    return getStore('readwrite').then(op((store) => map(entities, (key) => store.get(key))));
}

function removeMany(keys: IterableEntities<IDBValidKey | IDBKeyRange>): Promise<undefined[]> {
    return getStore('readwrite').then(op((store) => map(keys, (key) => store.delete(key))));
}

const kvdb = {
    getStore,
    get,
    add,
    set,
    remove,
    clear,
    count,
    getKey,
    getAllKeys,
    getAllValues,
    addMany,
    setMany,
    getMany,
    removeMany,
};

export default kvdb;
