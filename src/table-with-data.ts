// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { ColumnsConfig } from './columns-config.ts';
import { Example } from './example.ts';
import { Table } from './table.ts';

export class TableWithData extends Table {
  /**
   * constructor
   * @param columnsConfig The column selection of the table
   * @param rows The rows of the table
   * @throws If the number of columns in the data does not match the column
   * selection
   */
  constructor(
    public readonly columnsConfig: ColumnsConfig,
    public readonly rows: any[][],
  ) {
    super(columnsConfig);
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
    return new TableWithData(Example.columnsConfig(), Example.tableData());
  }

  /**
   * Returns an empty table
   */
  static empty() {
    return new TableWithData(Example.columnsConfig(), []);
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes() {
    this._updateAllRowHashes();
  }
}
