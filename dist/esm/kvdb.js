import { getStoreFromDB, map, op } from './idb-promise';
export const DB_NAME = 'keyvalue_database';
export const STORE_NAME = 'keyvalue_store';
function getStore(mode, version) {
    return getStoreFromDB(DB_NAME, STORE_NAME, { version, mode });
}
function get(key) {
    return getStore('readonly').then(op((store) => store.get(key)));
}
function add(key, value) {
    return getStore('readwrite').then(op((store) => store.add(value, key)));
}
function set(key, value) {
    return getStore('readwrite').then(op((store) => store.put(value, key)));
}
function remove(query) {
    return getStore('readwrite').then(op((store) => store.delete(query)));
}
function clear() {
    return getStore('readwrite').then(op((store) => store.clear()));
}
function count() {
    return getStore('readonly').then(op((store) => store.count()));
}
function getKey(key) {
    return getStore('readonly').then(op((store) => store.getKey(key)));
}
function getAllKeys(query, count) {
    return getStore('readonly').then(op((store) => store.getAllKeys(query, count)));
}
function getAllValues(query, count) {
    return getStore('readonly').then(op((store) => store.getAll(query, count)));
}
function addMany(entities) {
    return getStore('readwrite').then(op((store) => map(entities, ([key, value]) => store.add(value, key))));
}
function setMany(entities) {
    return getStore('readwrite').then(op((store) => map(entities, ([key, value]) => store.put(value, key))));
}
function getMany(entities) {
    return getStore('readwrite').then(op((store) => map(entities, (key) => store.get(key))));
}
function removeMany(keys) {
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
