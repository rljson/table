// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeEach, describe, expect, it } from 'vitest';

import { MultiEditResolved, Table, TableCache } from '../../src/index.ts';

describe('TableCache', () => {
  let cache: TableCache;
  let _cache: Map<string, any>;
  const table0: any = {};
  const table1: any = {};
  const table2: any = {};

  const multiEdit2 = MultiEditResolved.example;
  const multiEdit1 = multiEdit2.previous!;
  const multiEdit0 = multiEdit1.previous!;

  const master = {
    _hash: 'hash0',
  } as Table;

  beforeEach(() => {
    cache = new TableCache(2);
    _cache = (cache as any)._cache as Map<string, any>;
  });

  const allKeys = () => {
    return Array.from(_cache.keys());
  };

  describe('add', () => {
    it('adds the table to the cache', () => {
      const _cache = (cache as any)._cache as Map<string, any>;
      expect(_cache).toBeDefined();

      const table: any = {};
      cache.set(master, multiEdit0, table);
      expect(cache.get(master, multiEdit0)).toBe(table);
      const hash = multiEdit0._hash;

      // Get all keys from cache
      expect(allKeys()).toEqual([`hash0_${hash}`]);
    });

    it('removes the oldes key if cache is full', () => {
      const _cache = (cache as any)._cache as Map<string, any>;
      expect(_cache).toBeDefined();

      cache.set(master, multiEdit0, table0);
      cache.set(master, multiEdit1, table1);
      cache.set(master, multiEdit2, table2);

      expect(cache.get(master, multiEdit0)).toBeUndefined();
      expect(cache.get(master, multiEdit1)).toBe(table1);
      expect(cache.get(master, multiEdit2)).toBe(table2);
    });
  });
});
