// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Hash } from '@rljson/hash';
import { jsonValueType, JsonValueType } from '@rljson/json';

import { ColumnSelection } from './column-selection.ts';

/**
 * Represents a table data object
 */
export abstract class Table {
  /**
   * Constructor
   * @param columnSelection The column selection the table
   */
  constructor(public readonly columnSelection: ColumnSelection) {}

  /**
   * The number of rows in the table
   */
  get rowCount(): number {
    return this.rows.length;
  }

  /**
   * The number of columns in the table
   */
  get columnCount(): number {
    return this.columnSelection.count;
  }

  /**
   * Returns the row at the given index
   * @param index The index of the row
   * @returns The row data
   */
  row(index: number): any[] {
    return this.rows[index];
  }

  /**
   * Returns all rows of the table
   */
  abstract readonly rows: any[][];

  /**
   * Returns the types of the columns in the table
   */
  abstract readonly columnTypes: Array<JsonValueType>;

  /**
   * Returns the hash of the table.
   */
  get _hash(): string {
    if (!this._tableHash) {
      this._updateTableHash();
    }

    return this._tableHash;
  }

  /**
   * Returns a list of hashes for each row
   */
  get rowHashes(): string[] {
    if (this.rows.length > 0 && this._rowHashes.length === 0) {
      throw new Error(
        'Row hashes have not been calculated yet. ' +
          'Please make sure _rowHashes contains a valid hash for each row. ' +
          'Use _updateAllRowHashes() or write an optimized row hash calc method.',
      );
    }

    return this._rowHashes;
  }

  /**
   * Returns the value at the given row and column index
   * @param row The row index
   * @param column The column index
   */
  value(row: number, column: number): any {
    return this.rows[row][column];
  }

  /**
   * A list of all row indices of the table. This is used by views and filters.
   */
  get rowIndices(): number[] {
    return this._rowIndices;
  }

  /**
   * Call this method from derived classes to get the column types.
   *
   * Updates the types based on the data found in rows.
   * @param rows - the rows to derive the types from.
   * @param deep - if true, the types are derived from the data of all rows.
   * If false, only the first row is used.
   */
  static calcColumnTypes(rows: any[][], deep: boolean): JsonValueType[] {
    if (rows.length === 0) {
      return [];
    }

    const result: Array<JsonValueType | null> = new Array(rows[0].length).fill(
      null,
    );
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        // If the existing type is already 'any', we can skip this column.
        const existing = result[c];
        if (existing === 'json') {
          continue;
        }

        const value = row[c];
        if (value === null) {
          continue;
        }

        let colType = jsonValueType(value);

        // Different types are in the same column? Use Json.
        if (existing != null && existing !== colType) {
          colType = 'jsonValue';
        }

        result[c] = colType as JsonValueType;
      }

      // Are all column types estimated? Break.
      if (!deep && !result.includes(null)) {
        break;
      }
    }

    return result.map((e) => (e == null ? 'jsonValue' : e)) as JsonValueType[];
  }

  validateSelection(selection: ColumnSelection): void {
    const existing = this.columnSelection.addresses;

    const missingCols = selection.columns.filter((columnInfo) => {
      return existing.indexOf(columnInfo.address) < 0;
    });

    const missingAddresses = missingCols.map(
      (columnInfo) => `    - ${columnInfo.address}`,
    );

    const missingAliases = missingCols
      .map((columnInfo) => `"${columnInfo.alias}"`)
      .join(missingCols.length > 2 ? ', ' : ' and ');

    if (missingCols.length > 0) {
      throw new Error(
        [
          `Missing column(s) ${missingAliases}:`,
          '',
          '  Missing:',
          ...missingAddresses,
          '',
          '  Available:',
          ...existing.map((address) => `    -${address}`),
        ].join('\n'),
      );
    }
  }

  // ######################
  // Protected
  // ######################

  /**
   * Call this method to update row indices when rows have changed.
   */
  protected _updateRowIndices() {
    this._rowIndices = Array.from({ length: this.rowCount }, (_, i) => i);
  }

  /**
   * Implement this method in derived classes to update row hashes.
   *
   * Call this method once all rows have been initialized with data.
   */
  protected abstract _updateRowHashes(cfg: any): void;

  /**
   * Call this method from derived classes when all row hashes need to be
   * updated.
   *
   * Consider only calling this method when necessary, as it can be expensive.
   * If only a few rows have changed, consider updating only the affected rows.
   */
  protected _updateAllRowHashes() {
    const result = new Array(this.rows.length);
    for (let i = 0; i < this.rows.length; i++) {
      result[i] = Hash.default.calcHash(this.rows[i]);
    }

    this._rowHashes = result;
  }

  /**
   * Write the row hashes into this property.
   */
  protected _rowHashes: string[] = [];

  /**
   * Call this method once the column hashes have been updated.
   */
  protected _updateTableHash() {
    this._tableHash = Hash.default.calcHash(this.rowHashes);
  }

  // ######################
  // Private
  // ######################

  protected _rowIndices: number[] = [];

  private _tableHash: string = '';

  /**
   * Checks the data for consistency
   */
  check() {
    const columnCount = this.columnCount;
    for (let i = 0; i < this.rowCount; i++) {
      const row = this.row(i);
      if (row.length !== columnCount) {
        throw new Error(
          `Number of columns in data and in columnSelection do not match: ` +
            `Column count in "columnSelection" is "${columnCount}" ` +
            `and in row "${i}" is "${row.length}".`,
        );
      }
    }
  }
}
