// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { Example } from '../example.ts';
import { ColumnSelection } from '../selection/column-selection.ts';

import { Table } from './table.ts';

export class TableWithData extends Table {
  /**
   * constructor
   * @param columnSelection The column selection of the table
   * @param rows The rows of the table
   * @throws If the number of columns in the data does not match the column
   * selection
   */
  constructor(
    public readonly columnSelection: ColumnSelection,
    public readonly rows: any[][],
  ) {
    super(columnSelection);
    this._updateRowIndices();
    this._updateRowHashes();
    this.check();
    this.columnTypes = Table.calcColumnTypes(rows, false);
  }

  /**
   * @returns an array of column types for each column
   */
  readonly columnTypes: JsonValueType[];

  /**
   * An example table with data
   */
  static example() {
    return new TableWithData(Example.columnSelection(), Example.tableData());
  }

  /**
   * Returns an empty table
   */
  static empty() {
    return new TableWithData(Example.columnSelection(), []);
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes() {
    this._updateAllRowHashes();
  }
}
