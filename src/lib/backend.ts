export type IndType = number; // maybe use bigint(?)
export type ValType = number; // maybe use bigint(?) and maybe allow floating point values in the future

/**
 * The backend must make the read and increase operations atomic (not executing parts of one in the middle of the other). 
 * This is to make sure the next operations are atomic:
 *    * update(x, v) 
 *    * query(b) - query(a)
 */
export interface Backend {
  maximum: IndType;
  
  /**
   * The backend must make sure that the whole execution of these queries is atomic.
   * That is: we don't want an increase-operation to be executed sometime in the middle of
   * executing these read queries.
   * @param queries 
   */
  read(queries: IndType[]): Promise<ValType[]>;

  /**
   * The backend must make sure that each increase operation is atomic
   * @param queries 
   */
  increase(queries: IncreaseQuery[]): Promise<any[]>;
}

export class IncreaseQuery {
  constructor(
    public index: IndType,
    public val: ValType) {
  }
}