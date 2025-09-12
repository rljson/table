// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { RowSort } from './row-sort.ts';
import { TableSelected } from './table-selected.ts';
import { Table } from './table.ts';

/**
 * Provides a sorted version of an input table.
 */
export class TableSorted extends Table {
  // ...........................................................................
  /**
   * Constructor
   * @param table  The master table to select from
   * @param sort The sort to apply to the table
   */
  constructor(
    table: Table,

    public readonly sort: RowSort,
  ) {
    super(table.columnSelection);
    this._sortTable(table);
    this._updateRowHashes(table);
    this.columnTypes = table.columnTypes;
  }

  /**
   * The column types of the table.
   */
  columnTypes: JsonValueType[];

  get rows() {
    return this._rows;
  }

  // ...........................................................................
  static example(sort?: RowSort): TableSorted {
    sort ??= new RowSort({ 'basicTypes/numbersRef/intsRef/value': 'desc' });
    return new TableSorted(TableSelected.example, sort);
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes(original: Table) {
    // This table has just been sorted.
    // Thus take over the row hashes from the original table.
    const rowHashes = new Array(this._rows.length);
    for (let i = 0; i < this._rows.length; i++) {
      rowHashes[i] = original.rowHashes[this._sortedRowIndices[i]];
    }
    this._rowHashes = rowHashes;
  }

  // ######################
  // Private
  // ######################

  private _rows: any[][] = [];
  private _sortedRowIndices: number[] = [];

  private _sortTable(table: Table) {
    this._rowIndices = table.rowIndices;
    this._rows = table.rows;

    const sortIsEmpty = Object.keys(this.sort.columnSorts).length === 0;
    if (sortIsEmpty) {
      return;
    }

    this._sortRowIndices();
  }

  private _sortRowIndices() {
    const sortedIndices = this.sort!.applyTo(this);
    const sortedRows = new Array(this._rows.length);
    for (let i = 0; i < sortedIndices.length; i++) {
      sortedRows[i] = this._rows[sortedIndices[i]];
    }
    this._sortedRowIndices = sortedIndices;
    this._rows = sortedRows;
  }
}
