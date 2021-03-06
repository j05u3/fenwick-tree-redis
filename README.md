# fenwick-tree-redis

[![NPM version](https://img.shields.io/npm/v/fenwick-tree-redis.svg?style=flat-square)](https://www.npmjs.com/package/fenwick-tree-redis)
[![CircleCI](https://img.shields.io/circleci/project/github/j05u3/fenwick-tree-redis.svg?style=flat-square)](https://circleci.com/gh/j05u3/fenwick-tree-redis)

Binary Indexed Tree (aka Fenwick Tree) implementation with a Redis backend.

Usage examples: [here](./src/lib/bit.spec.ts#11)

[Generated docs](https://j05u3.github.io/fenwick-tree-redis/)

This project was generated with [typescript-starter](https://www.npmjs.com/package/typescript-starter)

## development

`npm run watch`

Once in a while I needed to `rm -rf build` to be able to run again. 

## TODOs

* Write tests with a real redis backend.
* Write stress tests (benchmarks) and evaluate high concurrency behavior.