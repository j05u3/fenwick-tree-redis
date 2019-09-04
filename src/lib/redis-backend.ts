import redis, { RedisClient } from 'redis';
import { Backend, IncreaseQuery, IndType, ValType } from './backend';

export interface RedisCredentials {
  readonly host: string;
  readonly port: number;
}

export const REDIS_LOCK_ERROR = 'REDIS_LOCK_ERROR';

/**
 * We use MULTI and open a new client every time (on each read and increase operation)
 * because we want to ensure atomicity.
 */
export class RedisHashBackend implements Backend {
  constructor(
    private redisCredentials: RedisCredentials | null,
    public maximum: IndType,
    public redisKey: string
  ) {}

  public async read(queries: readonly IndType[]): Promise<readonly ValType[]> {
    if (queries.length === 0) {
      return [];
    }
    const res = await this.atomic(null, queries);
    return res.map(v => (v == null ? 0 : v));
  }

  public async increase(
    queries: readonly IncreaseQuery[]
  ): Promise<ReadonlyArray<number | null>> {
    return this.atomic(queries, null);
  }

  protected async getNewRedisClient(): Promise<RedisClient> {
    if (this.redisCredentials == null) {
      return redis.createClient();
    }
    return redis.createClient(
      this.redisCredentials.port,
      this.redisCredentials.host
    );
  }

  private async atomic(
    incQueries: readonly IncreaseQuery[] | null,
    readQueries: readonly IndType[] | null
  ): Promise<ReadonlyArray<ValType | null>> {
    const client = await this.getNewRedisClient();

    return new Promise((resolve, reject) => {
      const multi = client.multi();

      if (incQueries != null) {
        for (const incQuery of incQueries) {
          multi.hincrby(this.redisKey, incQuery.index.toString(), incQuery.val);
        }
      }

      if (readQueries != null) {
        for (const index of readQueries) {
          multi.hget(this.redisKey, index.toString());
        }
      }

      multi.exec((redisErr, results) => {
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

        const toReturn = results.map(v => (v == null ? null : Number(v)));
        resolve(toReturn);
      });
    });
  }
}
