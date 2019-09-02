import { RedisHashBackend } from './redis-backend';
import redis from 'redis-mock';
import { RedisClient } from 'redis';

export default class RedisMockBackend extends RedisHashBackend {

  protected async getNewRedisClient(): Promise<RedisClient> {
    return redis.createClient();
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
