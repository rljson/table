// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { RowFilterProcessor, StringFilterProcessor } from '../index.ts';

import { TableSelected } from './table-selected.ts';
import { Table } from './table.ts';

/**
 * Provides a filtered version of an input table.
 */
export class TableFiltered extends Table {
  // ...........................................................................
  /**
   * Constructor
   * @param table  The master table to select from
   * @param filter The filter to apply to the table
   */
  constructor(
    table: Table,

    public readonly filter: RowFilterProcessor,
  ) {
    super(table.columnSelection);
    this._filterTable(table);
    this._updateRowIndices();
    this._updateRowHashes(table);
    this.columnTypes = table.columnTypes;
  }

  get rows() {
    return this._rows;
  }

  columnTypes: JsonValueType[];

  // ...........................................................................
  static example(filter?: RowFilterProcessor): TableFiltered {
    filter ??= new RowFilterProcessor({
      'basicTypes/stringsRef/value': new StringFilterProcessor(
        'startsWith',
        'a',
      ),
    });
    return new TableFiltered(TableSelected.example, filter);
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes(original: Table) {
    // This table has just been sorted.
    // Thus take over the row hashes from the original table.
    const rowHashes = new Array(this._rows.length);
    for (let i = 0; i < this._rows.length; i++) {
      rowHashes[i] = original.rowHashes[this._filteredRowIndices[i]];
    }
    this._rowHashes = rowHashes;
  }

  // ######################
  // Private
  // ######################

  private _rows: any[][] = [];

  private _filteredRowIndices: number[] = [];

  private _filterTable(table: Table) {
    const noFilter = Object.keys(this.filter.processors).length === 0;
    this._rows = table.rows;
    this._rowIndices = table.rowIndices;
    this._filteredRowIndices = table.rowIndices;

    if (noFilter) {
      return;
    }

    const filteredIndices = this.filter.applyTo(table);
    const filteredRows = new Array(filteredIndices.length);
    for (let i = 0; i < filteredIndices.length; i++) {
      filteredRows[i] = table.row(filteredIndices[i]);
    }
    this._filteredRowIndices = filteredIndices;
    this._rows = filteredRows;
  }
}
