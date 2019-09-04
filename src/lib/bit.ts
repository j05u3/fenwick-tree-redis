import { Backend, IncreaseQuery, IndType, ValType } from "./backend";

/* 
Inspiration from:
https://gist.github.com/jdp/5117101
*/

export default class BinaryIndexedTree {
  public readonly backend: Backend;

  constructor (backend: Backend) {
    this.backend = backend;
  }

  /**
   * Gets the accumulated sum in the 'array' until `ind` (inclusive).
   * 
   * Time: O(log(n))
   * @param ind 0-indexed
   */
  public async query(ind: IndType) : Promise<ValType> {
    ind++;
    const r = await this.backend.read(this.getReadQueries(ind));
    return r.reduce((ac, val) => ac + val);
  }

  /**
   * Increases the ind-th element in the 'array' by `val`
   * 
   * Note: if `ind` is greater than or equal `backend.maximum` this function won't do anything
   * 
   * Time: O(log(n))
   * @param ind 0-indexed
   * @param val integer number
   */
  public async update(ind: IndType, val: ValType): Promise<void> {
    const queries: IncreaseQuery[] = [];
    ind++;
    for (; ind <= this.backend.maximum; ind += (ind & (-ind))) {
      queries.push(new IncreaseQuery(ind, val));
    }
    await this.backend.increase(queries);
  }

  /**
   * If "to" is less than or equal "from" it returns zero.
   * Both indexed from zero.
   * 
   * Time: O(log(n))
   * @param from Inclusive
   * @param to Exclusive
   */
  public async rangeQuery(from: IndType, to: IndType): Promise<ValType> {
    if (to <= from) { return 0; }

    const fromReadQueries = this.getReadQueries(from);
    const results = 
    await this.backend.read(
      fromReadQueries.concat(this.getReadQueries(to + 1)));

    return results.reduce((ac, val, i) => {
      if (i < fromReadQueries.length) {
        return ac - val;
      }
      return ac + val;
    });
  }

  private getReadQueries(ind: IndType) : readonly IndType[] {
    const queries: IndType[] = [];
    for (; ind > 0; ind -= (ind & (-ind))) {
      queries.push(ind);
    }
    return queries;
  }
}