export type Int = number; // to be validated as Int in the future

/**
 * The backend must make the read and increase operations atomic. 
 * This is to make sure the next operations are atomic (not executing parts of one in the middle of the other):
 *    * update(x, v) 
 *    * query(b) - query(a)
 */
export interface Backend {
  maximum: Int;

  
  /**
   * The backend must make sure that the whole execution of these queries is atomic.
   * That is: we don't want an increase-operation to be executed sometime in the middle of
   * executing these read queries.
   * @param queries 
   */
  read(queries: number[]): Promise<number[]>;

  /**
   * The backend must make sure that each increase operation is atomic
   * @param queries 
   */
  increase(queries: IncreaseQuery[]): Promise<void>;
}

export class IncreaseQuery {
  index: Int;
  val: number;
}

/**
 * We use MULTI with different clients each time (on each read and increase operation) 
 * because we want to ensure atomicity.
 */
export class RedisHashBackend implements Backend {
  maximum: number;
  redisCredentials: any;

  constructor (redisCredentials: any, maximum: number) {
    this.redisCredentials = redisCredentials;
    this.maximum = maximum;
  }

  async read(queries: number[]): Promise<number[]> {
    if (queries.length == 0) return [];
    // TODO: build this wrapping all in a MULTI with a new redis client each time
    return [0];
  }

  async increase(queries: IncreaseQuery[]) {
    throw new Error("Method not implemented.");
  }
}