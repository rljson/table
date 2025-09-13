// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  shareReplay,
} from 'rxjs';

import {
  MultiEditColumnEstimator,
  MultiEditResolved,
  Table,
  TableCache,
  TableEditedMultiple,
  TableWithData,
} from '../index.ts';

/**
 * Takes a master table observable, a multi edit observable and creates
 * a new observable that delivers the master table with the multi edit applied.
 */
export class MultiEditMixer {
  constructor(
    public readonly masterTable$: Observable<Table>,
    public readonly multiEdit$: Observable<MultiEditResolved>,
    public readonly cacheSize = 5,
  ) {
    this.editedTable$ = this._initEditedTable();
    this._cache = new TableCache(this.cacheSize);
  }

  /**
   * The edited table.
   * Changes each time the master table or the multi edit changes.
   */
  editedTable$: Observable<Table>;

  static get example(): MultiEditMixer {
    return new MultiEditMixer(
      new BehaviorSubject<Table>(TableWithData.example()),
      new BehaviorSubject<MultiEditResolved>(MultiEditResolved.empty),
    );
  }

  // ######################
  // Private
  // ######################

  private _cache: TableCache;

  private _initEditedTable(): Observable<Table> {
    return combineLatest([this.masterTable$, this.multiEdit$]).pipe(
      // Do not process when master table has missing columns
      filter(([table, multiEdit]) => {
        return !this._hasMissingColumns(table, multiEdit);
      }),

      // Whenever the master table or the multi edit changes,
      // apply the edits to the master table and deliver the result.
      map(([masterTable, multiEdit]) => {
        const result = new TableEditedMultiple(
          masterTable,
          multiEdit,
          this._cache,
        );
        return result;
      }),

      // Always share the last value with new subscribers
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  // ...........................................................................
  private _hasMissingColumns(
    table: Table,
    multiEdit: MultiEditResolved,
  ): boolean {
    const requiredColumns = new MultiEditColumnEstimator(multiEdit)
      .columnSelection;
    const availableColumns = table.columnSelection;
    const difference = requiredColumns.addedColumns(availableColumns);
    return difference.length > 0;
  }
}
