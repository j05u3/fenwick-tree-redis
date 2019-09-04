# fenwick-tree-redis

[![NPM version](https://img.shields.io/npm/v/fenwick-tree-redis.svg)](https://www.npmjs.com/package/fenwick-tree-redis)
[![CircleCI](https://img.shields.io/circleci/project/github/j05u3/fenwick-tree-redis.svg)](https://circleci.com/gh/j05u3/fenwick-tree-redis)

Binary Indexed Tree (aka Fenwick Tree) implementation with a Redis backend

[Generated docs](https://j05u3.github.io/fenwick-tree-redis/)

This project was generated with [typescript-starter](https://www.npmjs.com/package/typescript-starter)

## development

`npm run watch`

Once in a while I needed to `rm -rf build` to be able to run again. 

## TODOs

* Write tests with a real redis backend
* Stress tests (benchmarks(?))
* Check why `npm test` fails 
* Remove sha.js dependency