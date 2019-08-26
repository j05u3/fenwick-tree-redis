import test from 'ava';
import { RedisHashBackend } from './redis-backend';
import { RedisClient } from 'redis';
import { IncreaseQuery } from './backend';


const redis = require("redis-mock");

class RedisMockBackend extends RedisHashBackend {
  
  private selectDb(client: RedisClient, i: number): Promise<void> {
    return new Promise((resolve, reject) => {
      client.select(i, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  i: number;
  public setDb(i: number) {
    this.i = i;
  }

  protected async getNewRedisClient(): Promise<RedisClient> {
    const client = redis.createClient();
    await this.selectDb(client, this.i);
    return client;
  }

  public async flushDb(): Promise<void> {
    const client = await this.getNewRedisClient();
    return await new Promise((resolve, reject) => {
      client.flushdb((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

async function getMockBackendInstance(i: number) {
  const backend = new RedisMockBackend(null, 1e6, "dummyKey");
  // clearing db (it is needed because all tests run on the same db)
  backend.setDb(i);
  await backend.flushDb();
  return backend;
}

async function getBackendWithSomeValues(i: number): Promise<RedisMockBackend> {
  const backend = await getMockBackendInstance(i);
  await backend.increase([
    new IncreaseQuery(0, 3),
    new IncreaseQuery(1, 3),
    new IncreaseQuery(2, 4),
    new IncreaseQuery(3, 2),
  ]);
  return backend;
}

test('testIncrease00', async t => {
  const backend = await getMockBackendInstance(0);
  const r = await backend.increase([
    new IncreaseQuery(0, 3),
    new IncreaseQuery(1, 3),
  ]);
  t.is(r.length, 2);
});

// test('testIncreaseAndEmptyQuery', async t => {
//   let backend = await getBackendWithSomeValues(2);
//   t.deepEqual(await backend.read([]), []);
// });

test('testIncreaseAndQuery01', async t => {
  let backend = await getBackendWithSomeValues(3);
  t.deepEqual(await backend.read([0]), [3]);
});
// test('testIncreaseAndQuery02', async t => {
//   let backend = await getBackendWithSomeValues(4);
//   t.deepEqual(await backend.read([0, 1, 2, 3]), [3, 3, 4, 2]);
// });

// test('testIncreaseAndQuery03', async t => {
//   let backend = await getBackendWithSomeValues(5);
//   t.deepEqual(await backend.read([0, 1, 2, 3, 4, 5]), [3, 3, 4, 2, 0, 0]);
// });

// test('testIncreaseAndQuery04', async t => {
//   const backend = await getMockBackendInstance(1);
//   await backend.increase([
//     new IncreaseQuery(0, 3),
//     new IncreaseQuery(1, 3),
//     new IncreaseQuery(1, 1),
//     new IncreaseQuery(1, 2),
//   ]);
//   t.deepEqual(await backend.read([0, 1]), [3, 6]);
// });
