// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { ColumnSelection } from './column-selection.ts';
import { Example } from './example.ts';
import { TableWithData } from './table-with-data.ts';
import { Table } from './table.ts';

/**
 * Offers a selection of columns of a given table
 *
 * Selects a subset of columns of the master table.
 */
export class TableSelected extends Table {
  // ...........................................................................
  /**
   * Constructor
   * @param columnSelection Columns selected from the master table
   * @param table The master table to select from
   */
  constructor(public readonly columnSelection: ColumnSelection, table: Table) {
    super(columnSelection);
    table.validateSelection(this.columnSelection);
    this._initRows(table);
    this._updateRowHashes();
    this._updateColumnTypes(table);
  }

  get rows() {
    return this._rows;
  }

  /**
   * The column types of the table.
   */
  get columnTypes() {
    return this._columnTypes;
  }

  // ...........................................................................
  static get example(): TableSelected {
    // Delete some columns from the example column selection
    const columnSelection = new ColumnSelection(
      Example.columnSelection().columns.slice(0, 2),
    );

    return new TableSelected(columnSelection, TableWithData.example());
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes() {
    this._updateAllRowHashes();
  }

  // ######################
  // Private
  // ######################

  private _rows: any[][] = [];
  private _masterColumnIndices: number[] = [];
  private _columnTypes!: JsonValueType[];

  private _updateColumnTypes(table: Table) {
    this._columnTypes = this._masterColumnIndices.map(
      (index) => table.columnTypes[index],
    );
  }

  private _initRows(table: Table) {
    const columnCount = this.columnSelection.count;
    const masterColumnIndices = new Array(columnCount);
    const rowsSelected = new Array(table.rowCount);

    let i = 0;
    for (const hash of this.columnSelection.addressHashes) {
      const index = table.columnSelection.columnIndex(hash);
      masterColumnIndices[i] = index;
      i++;
    }

    for (let i = 0; i < table.rowCount; i++) {
      const row = new Array(columnCount);
      for (let j = 0; j < columnCount; j++) {
        row[j] = table.value(i, masterColumnIndices[j]);
      }
      rowsSelected[i] = row;
    }

    this._rows = rowsSelected;
    this._rowIndices = table.rowIndices;
    this._masterColumnIndices = masterColumnIndices;
  }
}
