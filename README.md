# kvdb

a promise style keyValue store based on indexedDB

## How to use

```ts
// this tiny lib is build output with esm format.
// any all functions exports under the `kvdb` namespace,
// so you may need to import it as a module.
import kvdb form 'kvdb';

// and call some function use the `.` operator
kvdb.add('something', 'very simple');

// all functions are promise style.
kvdb.set('foo', 123).then(console.log);

// or you may perfer to use the async await syntax
// suppose there is a top level async
await kvdb.add('anything', 'not care about the result'); // don't care about the result.

const result = await kvdb.get('something');
console.log(result); // take with the result

// there are some multiply operator utils
await kvdb.setMany([['id1', 'user1'], ['id2', 'user2'], ['id3', 'user3']]);
kvdb.getMany(['id1', 'id2', 'id3']).then(console.log); // ['user1', 'user2', 'user3'];

// it will join all results as one.
kvdb.removeMany(['id1', 'id4']).then(console.log); // [undefined, undefined]

// this all.
kvdb.clear();
```

find a way to use it, by take a look at the [source code](./src)
