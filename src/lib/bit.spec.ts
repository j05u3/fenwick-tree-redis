// tslint:disable:no-expression-statement
import test from 'ava';
import RedisMockBackend from './redis-mock-backend';
import BinaryIndexedTree from './bit';


test('tests', async t => {
  const backend = new RedisMockBackend(null, 1e6, "dummyKey");

  await backend.flushDb();
  const bit = new BinaryIndexedTree(backend);

  t.deepEqual(await bit.rangeQuery(0, 0), 0);
  t.deepEqual(await bit.rangeQuery(1, 0), 0);

  await bit.update(0, 4);
  await bit.update(1, 8);
  await bit.update(11, 3);
  t.deepEqual(await bit.query(1), 12);

  
  await bit.update(13, 10);
  t.deepEqual(await bit.rangeQuery(0, 14), 25);
  t.deepEqual(await bit.rangeQuery(11, 14), 13);

  // updating out of the range
  await bit.update(1e6, 3);
  t.deepEqual(await bit.rangeQuery(1e6, 1e6 + 1), 0);

  // querying out of range
  t.deepEqual(await bit.query(1e6), 25);
  t.deepEqual(await bit.query(1e6 + 1), 25);


  await bit.update(1e6 - 1, 20);
  t.deepEqual(await bit.rangeQuery(1e6 - 1, 1e6), 20);
})