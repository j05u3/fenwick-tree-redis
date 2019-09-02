import { Backend, Int, IncreaseQuery } from "./backend";

/* 
Inspiration from:
https://gist.github.com/jdp/5117101
*/

export default class BinaryIndexedTree {
  backend: Backend;

  constructor (backend: Backend) {
    this.backend = backend;
  }

  private getReadQueries(ind: number) : number[] {
    const queries: number[] = [];
    for (; ind > 0; ind -= (ind & (-ind))) {
      queries.push(ind);
    }
    return queries;
  }

  /**
   * Gets the accumulated sum in the 'array' until "ind" (inclusive).
   * Time: O(log(n))
   * @param ind 0-indexed
   */
  async query(ind: Int) : Promise<number> {
    ind++;
    const r = await this.backend.read(this.getReadQueries(ind));
    return r.reduce((ac, val) => ac + val);
  }

  /**
   * Updates the ind-th element in the 'array'
   * Note: if ind is greater than or equal backend.maximum this function won't do anything
   * Time: O(log(n))
   * @param ind 0-indexed
   * @param val integer number
   */
  async update(ind: Int, val: number) {
    let queries: IncreaseQuery[] = [];
    ind++;
    for (; ind <= this.backend.maximum; ind += (ind & (-ind))) {
      queries.push(new IncreaseQuery(ind, val));
    }
    await this.backend.increase(queries);
  }

  /**
   * If "to" is less than or equal "from" it returns zero
   * Both indexed from zero.
   * @param from Inclusive
   * @param to Exclusive
   */
  async rangeQuery(from: Int, to: Int): Promise<number> {
    if (to <= from) return 0;

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
}