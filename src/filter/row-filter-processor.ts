// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import {
  ColumnFilterProcessor,
  ColumnSelection,
  RowFilter,
  Table,
} from '../index.ts';

// #############################################################################
export class RowFilterProcessor {
  // ...........................................................................
  constructor(
    columnFilters: Record<string, ColumnFilterProcessor>,
    public readonly operator: 'and' | 'or' = 'and',
  ) {
    this._columnFilters = this._initColumnFilters(columnFilters);
  }

  // ...........................................................................
  static fromModel(model: RowFilter) {
    const operator = model.operator;
    const columnFilters: Record<string, ColumnFilterProcessor> = {};
    for (const columnFilter of model.columnFilters) {
      const key = columnFilter.column;
      const processor = ColumnFilterProcessor.fromModel(columnFilter);
      columnFilters[key] = processor;
    }

    return new RowFilterProcessor(columnFilters, operator);
  }

  // ...........................................................................
  get processors(): ColumnFilterProcessor[] {
    return Object.values(this._columnFilters).map((item) => item.processor);
  }

  // ...........................................................................
  /// Returns an empty filter
  static get empty(): RowFilterProcessor {
    return new RowFilterProcessor({}, 'and');
  }

  // ...........................................................................
  /// Checks if two filters are equal
  equals(other: RowFilterProcessor): boolean {
    if (this.operator !== other.operator) {
      return false;
    }

    const thisKeys = Object.keys(this._columnFilters);
    const otherKeys = Object.keys(other._columnFilters);

    if (thisKeys.length !== otherKeys.length) {
      return false;
    }

    for (const key of thisKeys) {
      const a = this._columnFilters[key];
      const b = other._columnFilters[key];
      if (a?.processor.equals(b?.processor) === false) {
        return false;
      }
    }

    return true;
  }

  // ...........................................................................
  /// Returns the indices of the rows that match the filter
  ///
  /// Returns null if no filters are set or match the given row aliases.
  applyTo(table: Table): number[] {
    if (table.rowCount === 0) {
      return table.rowIndices;
    }

    // Throw when filter specifies non existent column addresses
    this._throwOnWrongAddresses(table);

    // Generate an array of filters
    const columnCount = table.columnCount;
    const columnHashes = table.columnSelection.addressHashes;

    const filterArray: ColumnFilterProcessor[] = new Array(columnCount).fill(
      null,
    );
    let hasFilters = false;
    for (let c = 0; c < columnCount; c++) {
      const hash = columnHashes[c];
      const filter = this._columnFilters[hash];
      if (filter) {
        filterArray[c] = filter.processor;
        hasFilters = true;
      }
    }

    // No filters set? Return unchanged indices.
    if (!hasFilters) {
      return table.rowIndices;
    }

    // Apply the filters
    switch (this.operator) {
      case 'and':
        return this._filterRowsAnd(table, filterArray);
      case 'or':
        return this._filterRowsOr(table, filterArray);
    }
  }

  // ######################
  // Private
  // ######################

  // ...........................................................................
  private readonly _columnFilters: Record<string, _ColumnFilterItem>;

  // ...........................................................................
  private _initColumnFilters(
    columnFilters: Record<string, ColumnFilterProcessor>,
  ) {
    const result: Record<string, _ColumnFilterItem> = {};

    const addresses = Object.keys(columnFilters);
    const columnSelection = ColumnSelection.fromAddresses(addresses);

    const hashes = columnSelection.addressHashes;
    const addresses2 = columnSelection.addresses;

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];
      const address = addresses2[i];
      const filter = columnFilters[address]!;

      result[hash] = {
        processor: filter,
        addressHash: hash,
        address: address,
      };
    }

    return result;
  }

  // ...........................................................................
  private _filterRowsAnd(
    table: Table,
    filters: ColumnFilterProcessor[],
  ): number[] {
    // Fill the array with all row indices
    const rowCount = table.rowCount;
    let remainingIndices: number[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
      remainingIndices[i] = i;
    }

    const columnCount = table.columnCount;

    for (let c = 0; c < columnCount; c++) {
      remainingIndices = this._filterColumnAnd(
        table,
        c,
        remainingIndices,
        filters,
      );
    }

    return remainingIndices;
  }

  // ...........................................................................
  private _filterColumnAnd(
    table: Table,
    columnIndex: number,
    remainingIndices: number[],
    filters: ColumnFilterProcessor[],
  ): number[] {
    const result: number[] = [];
    const filter = filters[columnIndex];
    if (filter == null) {
      return remainingIndices;
    }

    for (const i of remainingIndices) {
      const cellValue = table.value(i, columnIndex);

      if (filter.matches(cellValue)) {
        result.push(i);
      }
    }

    return result;
  }

  // ...........................................................................
  private _filterRowsOr(
    table: Table,
    filters: ColumnFilterProcessor[],
  ): number[] {
    // Fill the array with all row indices
    const applyTo: boolean[] = new Array(table.rowCount).fill(false);

    const columnCount = table.columnCount;

    for (let c = 0; c < columnCount; c++) {
      this._filterColumnOr(table, c, applyTo, filters);
    }

    let rowCount = 0;
    for (let r = 0; r < applyTo.length; r++) {
      if (applyTo[r]) {
        rowCount++;
      }
    }

    const result: number[] = new Array(rowCount);
    let resultIndex = 0;
    for (let r = 0; r < applyTo.length; r++) {
      if (applyTo[r]) {
        result[resultIndex] = r;
        resultIndex++;
      }
    }

    return result;
  }

  // ...........................................................................
  private _filterColumnOr(
    table: Table,
    columnIndex: number,
    applyTo: boolean[],
    filters: ColumnFilterProcessor[],
  ) {
    const filter = filters[columnIndex];
    if (filter == null) {
      return;
    }

    for (let r = 0; r < table.rowCount; r++) {
      if (applyTo[r]) {
        continue;
      }

      const cellValue = table.value(r, columnIndex);

      if (filter.matches(cellValue)) {
        applyTo[r] = true;
      }
    }
  }

  // ...........................................................................
  private _throwOnWrongAddresses(table: Table) {
    const availableAddresses = table.columnSelection.addresses;
    for (const item of Object.values(this._columnFilters)) {
      const address = item.address;
      if (availableAddresses.includes(address) === false) {
        throw new Error(
          `RowFilterProcessor: Error while applying filter to table: ` +
            `There is a column filter for address "${address}", but the table ` +
            `does not have a column with this address.\n\nAvailable addresses:\n` +
            `${availableAddresses.map((a) => `- ${a}`).join('\n')}`,
        );
      }
    }
  }
}

// #############################################################################
interface _ColumnFilterItem {
  processor: ColumnFilterProcessor;
  addressHash: string;

  address: string;
}
