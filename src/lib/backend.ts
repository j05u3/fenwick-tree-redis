export type Int = number; // maybe use bigint(?)
export type ValType = number; // maybe use bigint(?)
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
  increase(queries: IncreaseQuery[]): Promise<any[]>;
}

export class IncreaseQuery {
  constructor(
    public index: Int,
    public val: ValType) {
  }
}