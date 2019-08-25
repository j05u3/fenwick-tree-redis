import { Backend, Int } from "./backend";

/* 
Inspiration from:
https://gist.github.com/jdp/5117101
*/

export interface Slice {
  a: number;
  b: number;
}

export default class BinaryIndexedTree {
  backend: Backend;

  constructor (backend: Backend) {
    this.backend = backend;
  }

  private getReadQueries(ind: number) : number[] {
    const queries = [];
    for (; ind > 0; ind -= (ind & (-ind))) {
      queries.push(ind);
    }
    return queries;
  }

  async query(ind: Int) : Promise<number> {
    this.validateInd(ind);
    const r = await this.backend.read(this.getReadQueries(ind));
    return r.reduce((ac, val) => ac + val);
  }

  private validateInd(ind: Int) {
    // TODO: should we just fail without and exception?
    if (ind < 0 || ind > this.backend.maximum) throw "INVALID_INDEX";
  }

  async update(ind: Int, val: number) {
    this.validateInd(ind);
    let queries = [];
    for (; ind <= this.backend.maximum; ind += (ind & (-ind))) {
      queries.push({ind, val});
    }
    await this.backend.increase(queries);
  }

  /**
   * Inclusive on both bounds
   * @param from 
   * @param to
   */
  async rangeQuery(from: Int, to: Int): Promise<number> {
    const _to = to;
    to = Math.max(from, _to);
    from = Math.min(from, _to);

    const fromResults = 
    await this.backend.read(this.getReadQueries(from - 1));
    const toResults = 
    await this.backend.read(this.getReadQueries(to));

    return toResults.reduce((ac, val) => ac + val)
      - fromResults.reduce((ac, val) => ac + val);
  }
}