import 'fake-indexeddb/auto';
import kvdb, { DB_NAME, STORE_NAME } from './kvdb';

describe('kvdb', function () {
    describe('getStore', function () {
        it(`should create a database, which named ${DB_NAME}`, async () => {
            const store = await kvdb.getStore();
            expect(store.transaction.db).toBeInstanceOf(IDBDatabase);
            expect(store.transaction.db.name).toEqual(DB_NAME);
        });

        it(`should create ObjectStore, named ${STORE_NAME}`, async () => {
            const store = await kvdb.getStore();
            expect(store.transaction.objectStore(STORE_NAME)).toBeInstanceOf(IDBObjectStore);
        });
    });

    describe('count', function () {
        it('should return the number', async () => {
            expect(typeof (await kvdb.count())).toEqual('number');
        });
    });

    describe('clear', function () {
        it('should set the count to 0', async () => {
            await kvdb.set('foo', 'bar');
            await kvdb.clear();

            expect(await kvdb.count()).toEqual(0);
        });

        it('should remove all items from the store', async () => {
            await kvdb.set('foo', 123);
            await kvdb.set('bar', 234);

            // before
            expect(await kvdb.get('foo')).toBe(123);
            expect(await kvdb.get('bar')).toBe(234);

            await kvdb.clear();

            // after
            expect(await kvdb.get('foo')).toBe(undefined);
            expect(await kvdb.get('bar')).toBe(undefined);
        });
    });

    describe('count', function () {
        it('should return the count of current records', async () => {
            await kvdb.clear();

            // before
            expect(await kvdb.count()).toEqual(0);
            await kvdb.set('foo', 123);
            await kvdb.set('bar', 234);
            // after
            expect(await kvdb.count()).toEqual(2);
        });
    });

    describe('add', function () {
        it('should add a new record to the database', async () => {
            const preCount = await kvdb.count();

            await kvdb.add(Math.random(), 'randomName');
            expect(await kvdb.count()).toEqual(preCount + 1);

            await kvdb.set(Math.random(), 'randomName');
            expect(await kvdb.count()).toEqual(preCount + 2);
        });
    });

    describe('get', function () {
        it('should return the value if it in the store', async () => {
            await kvdb.add('apple', 123);
            expect(await kvdb.get('apple')).toEqual(123);

            const priceData = { price: 8 };
            await kvdb.set('banana', priceData);
            expect(await kvdb.get('banana')).toEqual(priceData);

            await kvdb.remove('apple');
            expect(await kvdb.get('apple')).toEqual(undefined);
        });

        it('should return the undefined if value not found', async () => {
            await kvdb.add('apple', 123);
            expect(await kvdb.get('apple')).toEqual(123);

            await kvdb.remove('apple');
            expect(await kvdb.get('apple')).toEqual(undefined);
        });
    });

    describe('add', function () {
        it('should return the key of record, if succeeded', async () => {
            expect(await kvdb.add('key', 1)).toEqual('key');
            expect(await kvdb.add(['key', 'value'], 1)).toEqual(['key', 'value']);

            const rand = Math.random();
            expect(await kvdb.add(rand, 'baz')).toEqual(rand);

            const date = new Date();
            expect(await kvdb.add(date, 'date')).toEqual(date);
        });

        it('should accepts string as key', async () => {
            await kvdb.clear();
            expect(await kvdb.add('foo', 1)).toEqual('foo');
            expect(await kvdb.get('foo')).toEqual(1);

            expect(await kvdb.add('bar', 1)).toEqual('bar');
            expect(await kvdb.get('bar')).toEqual(1);
        });

        it('should accepts number as key', async () => {
            await kvdb.clear();
            expect(await kvdb.add(123, 1)).toEqual(123);
            expect(await kvdb.get(123)).toEqual(1);

            expect(await kvdb.add(234, 2)).toEqual(234);
            expect(await kvdb.get(234)).toEqual(2);
        });

        it('should accepts Date Object as key', async () => {
            await kvdb.clear();
            const date = new Date();
            expect(await kvdb.add(date, 1)).toEqual(date);
            expect(await kvdb.get(date)).toEqual(1);
        });

        it('should accepts arrayValue as key', async () => {
            await kvdb.clear();
            expect(await kvdb.add([123, 234], 1)).toEqual([123, 234]);
            expect(await kvdb.add([123, '234'], 2)).toEqual([123, '234']);

            const d = new Date();
            expect(await kvdb.add([123, '234', d], 2)).toEqual([123, '234', d]);
            expect(await kvdb.get([123, '234', d])).toEqual(2);
        });

        it('should accepts ArrayBuffer as key', async () => {
            await kvdb.clear();
            const typeArray = new Uint8Array([1, 2, 3]);
            expect(await kvdb.add(typeArray, 2)).toEqual(typeArray.buffer);
            expect(await kvdb.get(typeArray)).toEqual(2);
        });

        it('should throw an error if add same key twice', async () => {
            await kvdb.add('sameName', 'foo');

            expect(async () => await kvdb.add('sameName', 'foo')).rejects.toBeNull();
            expect(async () => await kvdb.add('sameName', 'bar')).rejects.toBeNull();
        });

        it('should add a new record to the store', async () => {
            await kvdb.add('string', 'string');
            expect(await kvdb.get('string')).toEqual('string');

            await kvdb.add('number', 123);
            expect(await kvdb.get('number')).toEqual(123);

            const date = new Date();
            await kvdb.add('date', date);
            const dateValue = await kvdb.get('date');
            expect(dateValue).toEqual(date);
            expect(Object.prototype.toString.call(dateValue)).toEqual('[object Date]');

            const arrayValue = [123, 'abc'];
            await kvdb.add('array', arrayValue);
            expect(await kvdb.get('array')).toEqual(arrayValue);

            const arrayBuffer = new Uint8Array([1, 2, 3]);
            await kvdb.add('arrayBuffer', arrayBuffer);
            expect((await kvdb.get<Uint8Array>('arrayBuffer')).buffer).toEqual(arrayBuffer.buffer);

            const objectValue = { 123: 'abc' };
            await kvdb.add('object', objectValue);
            expect(await kvdb.get('object')).toEqual(objectValue);

            const setValue = new Set([1, 2]);
            await kvdb.add('set', setValue);
            const setResult = await kvdb.get<Set<unknown>>('set');
            expect(setResult.has(1));
            expect([...setResult.values()]).toMatchObject([1, 2]);

            const mapValue = new Map();
            mapValue.set(1, 2);
            await kvdb.add('map', mapValue);
            const mapResult = await kvdb.get<Map<unknown, unknown>>('map');
            expect(mapResult.get(1)).toEqual(2);
        });

        it('should not store un-cloneable values', async () => {
            const fnValue = () => 1;
            expect(async () => await kvdb.add('fn', fnValue)).rejects.toThrow();

            const symbolValue = Symbol('cool');
            expect(async () => await kvdb.add('symbol', symbolValue)).rejects.toThrow();
        });
    });

    describe('set', function () {
        it('should update value', async () => {
            await kvdb.set('a', 'old value');
            expect(await kvdb.get('a')).toEqual('old value');

            await kvdb.set('a', 'new value');
            expect(await kvdb.get('a')).toEqual('new value');
        });

        it('should return the key when successful', async () => {
            expect(await kvdb.set('a', 'a')).toEqual('a');
            expect(await kvdb.set(['a'], ['a'])).toEqual(['a']);
            expect(await kvdb.set(1, 1)).toEqual(1);
            expect(await kvdb.set([1, 2], [1, 2])).toEqual([1, 2]);
        });
    });

    describe('get', function () {
        it('should return the value if matched', async () => {
            await kvdb.add('apple', 123);
            expect(await kvdb.get('apple')).toEqual(123);

            const priceData = { price: 8 };
            await kvdb.set('banana', priceData);
            expect(await kvdb.get('banana')).toEqual(priceData);
        });
    });

    describe('getKey', function () {
        it('should return the stored key', async () => {
            await kvdb.set('uniqueKey', 123);
            expect(await kvdb.getKey('uniqueKey')).toEqual('uniqueKey');

            const dateKey = new Date();
            await kvdb.set(dateKey, 123);
            expect(await kvdb.getKey(dateKey)).toEqual(dateKey);
        });

        it('should return undefined if the key is not included', async () => {
            expect(await kvdb.getKey('notInclude')).toEqual(undefined);
        });
    });

    describe('remove', function () {
        it('should return undefined if succeeded', async () => {
            await kvdb.set('xyz', 123);
            expect(await kvdb.remove('xyz')).toBe(undefined);
        });

        it('remove key value pairs if found', async () => {
            await kvdb.set('xyz', 123);
            expect(await kvdb.get('xyz')).toBe(123);

            expect(await kvdb.remove('xyz')).toBe(undefined);
            expect(await kvdb.get('xyz')).toBe(undefined);
        });

        it('should be successful even if there are no matched key', async () => {
            expect(await kvdb.get('000')).toBe(undefined);
            expect(await kvdb.remove('000')).toBe(undefined);

            expect(await kvdb.get('111')).toBe(undefined);
            expect(await kvdb.remove('111')).toBe(undefined);
        });
    });

    describe('getAllKeys', function () {
        it('should return all keys', async () => {
            await kvdb.clear();
            expect(await kvdb.getAllKeys()).toHaveLength(0);

            await kvdb.set('foo', 1);
            await kvdb.set('bar', 2);
            expect(await kvdb.getAllKeys()).toHaveLength(2);
            expect(await kvdb.getAllKeys()).toContain('foo');
            expect(await kvdb.getAllKeys()).toContain('bar');
        });

        it('should return the matched keys', async () => {
            await kvdb.clear();
            expect(await kvdb.getAllValues()).toHaveLength(0);

            await kvdb.set('foo', 1);
            await kvdb.set('bar', 2);
            await kvdb.set('barz', 3);

            expect(await kvdb.getAllKeys('foo')).toEqual(['foo']);
            expect(await kvdb.getAllKeys(IDBKeyRange.bound('bar', 'baz'))).toEqual(['bar', 'barz']);
        });
    });

    describe('getAllValues', function () {
        it('should return all values', async () => {
            await kvdb.clear();
            expect(await kvdb.getAllValues()).toHaveLength(0);

            await kvdb.set('foo', 1);
            await kvdb.set('bar', 2);

            expect(await kvdb.getAllValues()).toHaveLength(2);
            expect(await kvdb.getAllValues()).toContain(1);
            expect(await kvdb.getAllValues()).toContain(2);
        });

        it('should return the matched values', async () => {
            await kvdb.clear();
            expect(await kvdb.getAllValues()).toHaveLength(0);

            await kvdb.set('foo', 1);
            await kvdb.set('bar', 2);
            await kvdb.set('barz', 3);

            expect(await kvdb.getAllValues('foo')).toEqual([1]);
            expect(await kvdb.getAllValues(IDBKeyRange.bound('bar', 'barz'))).toEqual([2, 3]);
        });
    });

    describe('multiple operations utils', function () {
        describe('addMany', function () {
            it('should add multiple values', async () => {
                await kvdb.clear();
                await kvdb.addMany([
                    [1, 'a'],
                    [2, 'b'],
                ]);

                expect(await kvdb.count()).toEqual(2);
                expect(await kvdb.get(1)).toEqual('a');
                expect(await kvdb.get(2)).toEqual('b');

                expect(await kvdb.getAllKeys()).toEqual([1, 2]);
                expect(await kvdb.getAllValues()).toEqual(['a', 'b']);
            });

            it('should return all keys if succeeded', async () => {
                await kvdb.clear();
                expect(
                    await kvdb.addMany([
                        [1, 'a'],
                        [2, 'b'],
                    ])
                ).toEqual([1, 2]);
            });

            it('should failed it any subjobs failed', async () => {
                await kvdb.clear();
                const data = [
                    [1, 'a'],
                    [1, 'b'],
                ];
                expect(async () => await kvdb.addMany(data)).rejects.toBeNull();
                expect(await kvdb.count()).toEqual(0);
                expect(await kvdb.getKey(1)).toEqual(undefined);
            });
        });

        describe('setMany', function () {
            it('should update multiple values at once', async () => {
                await kvdb.clear();
                const array = [
                    [1, 'x'],
                    [2, 'y'],
                    [3, 'z'],
                ];
                expect(await kvdb.setMany(array)).toEqual([1, 2, 3]);
                expect(await kvdb.getAllKeys()).toEqual([1, 2, 3]);
                expect(await kvdb.getAllValues()).toEqual(['x', 'y', 'z']);

                const set = new Set([1, 2, 3]);
                expect(await kvdb.setMany(set.entries())).toEqual([1, 2, 3]);
                expect(await kvdb.getAllKeys()).toEqual([...set.keys()]);
                expect(await kvdb.getAllValues()).toEqual([...set.values()]);

                const map = new Map([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c'],
                ]);
                expect(await kvdb.setMany(map.entries())).toEqual([1, 2, 3]);
                expect(await kvdb.getAllKeys()).toEqual([...map.keys()]);
                expect(await kvdb.getAllValues()).toEqual([...map.values()]);
            });
        });

        describe('getMany', function () {
            it('should return an array as the result of all the values', async () => {
                await kvdb.clear();
                expect(await kvdb.getMany([])).toEqual([]);
                expect(await kvdb.getMany([1, 2, 3])).toEqual([undefined, undefined, undefined]);

                await kvdb.set(2, 2);
                expect(await kvdb.getMany([1, 2, 3])).toEqual([undefined, 2, undefined]);
            });

            it('should get multiple values at once', async () => {
                await kvdb.clear();
                const array = [
                    [1, 'x'],
                    [2, 'y'],
                    [3, 'z'],
                ];
                expect(await kvdb.setMany(array)).toEqual([1, 2, 3]);
                expect(await kvdb.getMany([1, 3])).toEqual(['x', 'z']);

                const set = new Set([1, 2, 3]);
                expect(await kvdb.setMany(set.entries())).toEqual([1, 2, 3]);
                expect(await kvdb.getMany([2, 3])).toEqual([2, 3]);

                const map = new Map([
                    [1, 'a'],
                    [2, 'b'],
                    [3, 'c'],
                ]);
                expect(await kvdb.setMany(map.entries())).toEqual([1, 2, 3]);
                expect(await kvdb.getMany([1, 2])).toEqual(['a', 'b']);
            });
        });

        describe('removeMany', function () {
            it('should remove every record from store', async () => {
                await kvdb.clear();
                await kvdb.setMany([
                    [1, 1],
                    [2, 2],
                    [3, 3],
                ]);

                await kvdb.removeMany([1, 2, 3]);
                expect(await kvdb.getMany([1, 2, 3])).toEqual([undefined, undefined, undefined]);
            });

            it('should return an array containing all undefined', async () => {
                await kvdb.clear();
                await kvdb.setMany([
                    [1, 1],
                    [2, 2],
                    [3, 3],
                ]);
                expect(await kvdb.removeMany([1, 2, 3])).toEqual([undefined, undefined, undefined]);

                await kvdb.add(2, 2);
                expect(await kvdb.removeMany([1, 2, 3])).toEqual([undefined, undefined, undefined]);
            });
        });
    });
});
