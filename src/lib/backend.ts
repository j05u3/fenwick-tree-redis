export type Int = number; // to be validated as Int in the future

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

export class RedisHashBackend implements Backend {
  maximum: number;
  redisCredentials: any;

  constructor (redisCredentials: any, maximum: number) {
    this.redisCredentials = redisCredentials;
    this.maximum = maximum;
  }

  // We use MULTI with different clients each time because we want to:
  // * Be able to make the next operations atomic (not executing parts of one in the middle of the other):
  //    * update(x, v) 
  //    * query(b) - query(a)
  async read(queries: number[]): Promise<number[]> {
    if (queries.length == 0) return [];
    // TODO: build this wrapping all in a MULTI with a new redis client each time
    return [0];
  }

  async increase(queries: IncreaseQuery[]) {
    throw new Error("Method not implemented.");
  }
}