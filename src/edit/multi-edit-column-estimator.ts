// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { ColumnSelection, MultiEditResolved } from '../index.ts';

/**
 * Takes an multi edit and estimates all columns needed to apply the multi edit.
 */
export class MultiEditColumnEstimator {
  /**
   * Constructor
   * @param multiEdit The multi edit to get the used columns from.
   * @param cache  The cache to store the results for later reuse.
   * @param cacheSize The size of the cache.
   */
  constructor(
    public readonly multiEdit: MultiEditResolved,
    public readonly cache: Map<string, string[]> = new Map(),
    public readonly cacheSize = 3,
  ) {
    this._columnSelection = this._initColumnSelection();
  }

  /**
   * Returns the column selection that is needed to apply the multi edit.
   */
  get columnSelection(): ColumnSelection {
    return this._columnSelection;
  }

  /**
   * Returns the number of cache usages.
   */
  get cacheUsages(): number {
    return this._cacheUsages;
  }

  static get example() {
    const multiEdit = MultiEditResolved.example;
    return new MultiEditColumnEstimator(multiEdit);
  }

  // ######################
  // Private
  // ######################

  private _columnSelection: ColumnSelection;
  private _cacheUsages: number = 0;

  // ...........................................................................
  private _initColumnSelection(): ColumnSelection {
    const addresses: string[] = [];
    this._collectColumns(this.multiEdit, addresses);
    return ColumnSelection.fromAddresses(Array.from(addresses));
  }

  // ...........................................................................
  private _collectColumns(multiEdit: MultiEditResolved, result: string[]) {
    // Use cached result when available
    const cachedResult = this.cache.get(multiEdit._hash);
    if (cachedResult) {
      this._cacheUsages++;
      result.push(...cachedResult);
      return;
    }

    if (multiEdit.previous) {
      this._collectColumns(multiEdit.previous, result);
    }

    // Collect columns from filters
    for (const filter of multiEdit.edit.filter.columnFilters) {
      result.push(filter.column);
    }

    // Collect columns from all actions
    for (const action of multiEdit.edit.actions) {
      result.push(action.column);
    }

    // Cache result
    this._cacheResult(multiEdit, result);

    // Return result
    return result;
  }

  // ...........................................................................
  private _cacheResult(multiEdit: MultiEditResolved, result: string[]) {
    result = Array.from(new Set(result));
    this.cache.set(multiEdit._hash, result);
    if (this.cache.size > this.cacheSize) {
      this.cache.delete(this.cache.keys().next().value!);
    }
  }
}
