import test from 'ava';
import { IncreaseQuery } from './backend';
import RedisMockBackend from './redis-mock-backend';


async function getMockBackendInstance() {
  const backend = new RedisMockBackend(null, 1e6, "dummyKey");
  // clearing db (it is needed because all tests run on the same db)
  await backend.flushDb();
  return backend;
}

async function getBackendWithSomeValues(): Promise<RedisMockBackend> {
  const backend = await getMockBackendInstance();
  await backend.increase([
    new IncreaseQuery(0, 3),
    new IncreaseQuery(1, 3),
    new IncreaseQuery(2, 4),
    new IncreaseQuery(3, 2),
  ]);
  return backend;
}

test('tests', async t => {
  // had to put all tests here because I couldn't find a way to make 
  // redis-mock use a different and clean db for each test
  let backend = await getMockBackendInstance();
  const r = await backend.increase([
    new IncreaseQuery(0, 11),
    new IncreaseQuery(1, 18),
  ]);
  t.is(r.length, 2);

  backend = await getBackendWithSomeValues();
  t.deepEqual(await backend.read([]), []);

  backend = await getBackendWithSomeValues();
  t.deepEqual(await backend.read([0]), [3]);

  backend = await getBackendWithSomeValues();
  t.deepEqual(await backend.read([0, 1, 2, 3]), [3, 3, 4, 2]);

  backend = await getBackendWithSomeValues();
  t.deepEqual(await backend.read([0, 1, 2, 3, 4, 5]), [3, 3, 4, 2, 0, 0]);

  backend = await getMockBackendInstance();
  await backend.increase([
    new IncreaseQuery(0, 3),
    new IncreaseQuery(1, 3),
    new IncreaseQuery(1, 1),
    new IncreaseQuery(1, 2),
  ]);
  t.deepEqual(await backend.read([0, 1]), [3, 6]);

});