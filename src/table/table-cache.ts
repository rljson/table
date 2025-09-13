// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { MultiEditResolved } from '../edit/multi-edit-resolved.ts';

import { Table } from './table.ts';

/**
 * Caches tables e.g. for increasing performance of multi edits.
 */
export class TableCache {
  constructor(public readonly cacheSize = 5) {}

  /**
   * Write a table to the cache
   * @param master The master table the multi edit belongs to
   * @param multiEdit The multi edit the table should be cached
   * @param processed The table to be cached
   */
  set(master: Table, multiEdit: MultiEditResolved, processed: Table) {
    const key = this.cacheKey(master, multiEdit);

    if (this._cache.size >= this.cacheSize) {
      const firstCachKey = this._cache.keys().next().value!;
      this._cache.delete(firstCachKey);
    }
    this._cache.set(key, processed);
  }

  /**
   * Get a table from the cache
   * @param master The master table the multi edit is applied to
   * @param multiEdit The multi edit the table should be taken from cache
   * @returns The table from the cache or undefined if not found.
   */
  get(master: Table, multiEdit: MultiEditResolved): Table | undefined {
    const key = this.cacheKey(master, multiEdit);
    return this._cache.get(key);
  }

  /**
   * Check the key
   * @param master The master table to which the multiEdit is applied
   * @param multiEdit The multiEdit to be applied to the table
   * @returns The cache key to the cached result
   */
  cacheKey(master: Table, multiEdit: MultiEditResolved): string {
    return master._hash + '_' + multiEdit._hash;
  }

  // ######################
  // Private
  // ######################

  private _cache = new Map<string, Table>();
}
