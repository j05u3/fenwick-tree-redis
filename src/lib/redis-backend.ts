import redis, { RedisClient } from 'redis';
import { Backend, IncreaseQuery } from './backend';

export class RedisCredentials {
  host: string;
  port: number;
}

export const REDIS_LOCK_ERROR = "REDIS_LOCK_ERROR";
export const REDIS_MULTI_RESULT_NOT_OK = "REDIS_MULTI_RESULT_NOT_OK";

/**
 * We use MULTI with opening a new client each time (on each read and increase operation) 
 * because we want to ensure atomicity.
 */
export class RedisHashBackend implements Backend {

  constructor (
    private redisCredentials: RedisCredentials, 
    public maximum: number, 
    public redisKey: string) {
  }

  async read(queries: number[]): Promise<number[]> {
    if (queries.length == 0) return [];
    const res = await this.atomic(null, queries);
    return res.map(v => ((v == null)? 0 : v));
  }

  async increase(queries: IncreaseQuery[]): Promise<(number|null)[]> {
    return await this.atomic(queries, null);
  }

  protected async getNewRedisClient(): Promise<RedisClient> {
    return redis.createClient(this.redisCredentials.port, 
      this.redisCredentials.host);
  }

  private async atomic(incQueries: IncreaseQuery[], 
    readQueries: number[]): Promise< (number|null) []> {
    let client = await this.getNewRedisClient();

    return await new Promise((resolve, reject) => {
      const multi = client.multi();

      if (incQueries != null) for (const incQuery of incQueries) {
        multi.hincrby(this.redisKey, 
          incQuery.index.toString(), incQuery.val);
      }

      if (readQueries != null) for (const index of readQueries) {
        multi.hget(this.redisKey, 
          index.toString());
      }

      multi
      .exec((redisErr, results) => {
        /**
          * If err is null, it means Redis successfully attempted 
          * the operation.
          */
        if (redisErr) {
          reject(redisErr);
          return;
        }
        
        /**
          * If results === null, it means that a concurrent redisClient
          * changed the key while we were processing it and thus 
          * the execution of the MULTI command was not performed.
          * 
          * NOTICE: Failing an execution of MULTI is not considered
          * an error. So you will have err === null and results === null
          */
        if (results === null) {
          reject(REDIS_LOCK_ERROR);
          return;
        }

        const toReturn = results.map(v => ((v == null)? null: Number(v)));
        resolve(toReturn);
      });
    });
  }
}