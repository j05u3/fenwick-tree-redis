import { RedisClient } from 'redis';
import redis from 'redis-mock';
import { RedisHashBackend } from './redis-backend';

export default class RedisMockBackend extends RedisHashBackend {

  public async flushDb(): Promise<void> {
    const client = await this.getNewRedisClient();
    return new Promise((resolve, reject) => {
      client.flushdb((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  protected async getNewRedisClient(): Promise<RedisClient> {
    return redis.createClient();
  }
}
