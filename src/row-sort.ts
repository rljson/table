// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { ColumnSelection } from './column-selection.ts';
import { Table } from './table.ts';

/// Sort configuration for catalog data
export class RowSort {
  constructor(columnSorts: Record<string, 'asc' | 'desc'>) {
    this._columnSorts = this._initColumnSorts(columnSorts);
  }

  // ...........................................................................
  /**
   * Returns an empty RowSort object.
   */
  static get empty(): RowSort {
    return new RowSort({});
  }

  // ...........................................................................
  /**
   * Sorts the rows of a table according to the sort configuration.
   * @param table - The table to be sorted
   * @returns Returns the row indices in a sorted manner
   */
  applyTo(table: Table): number[] {
    if (table.rowCount === 0) {
      return table.rowIndices;
    }

    // Throw when filter specifies non existent column addresses
    this._throwOnWrongAddresses(table);

    const addressHashes = table.columnSelection.addressHashes;

    // Generate an array of sort operators
    const sortIndices: number[] = [];
    const sortOrders: Array<'asc' | 'desc'> = [];

    let hasSorts = false;
    for (const item of this._columnSorts) {
      const index = addressHashes.indexOf(item.addressHash);
      sortIndices.push(index);
      sortOrders.push(item.order);

      hasSorts = true;
    }

    // No filters set? Return unchanged rows.
    if (!hasSorts) {
      return table.rowIndices;
    }

    // Apply the filters
    return this._sortRows(table, sortIndices, sortOrders);
  }

  // ...........................................................................
  get columnSorts(): Record<string, 'asc' | 'desc'> {
    const result: Record<string, 'asc' | 'desc'> = {};
    for (const sort of this._columnSorts) {
      result[sort.address] = sort.order;
    }

    return result;
  }

  // ######################
  // Private
  // ######################

  private readonly _columnSorts: _SortItem[];

  // ...........................................................................
  private _initColumnSorts(
    columnSorts: Record<string, 'asc' | 'desc'>,
  ): _SortItem[] {
    const result: _SortItem[] = [];
    const columnSelection = ColumnSelection.fromAddresses(
      Object.keys(columnSorts),
    );

    const addresses = columnSelection.addresses;
    const addressHashes = columnSelection.addressHashes;

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const addressHash = addressHashes[i];
      result.push({
        address,
        addressHash,
        order: columnSorts[address],
      });
    }

    return result;
  }

  // ...........................................................................
  private _sortRows(
    table: Table,
    sortIndices: number[],
    sortOrders: Array<'asc' | 'desc'>,
  ): number[] {
    const result = [...table.rowIndices];

    // Sort
    return result.sort((a, b) => {
      const rowA = table.row(a);
      const rowB = table.row(b);

      let i = 0;
      for (const index of sortIndices) {
        const sort = sortOrders[i++];
        const vA = rowA[index];
        const vB = rowB[index];
        if (vA === vB) {
          continue;
        }
        if (sort === 'asc') {
          return vA < vB ? -1 : 1;
        } else {
          return vA < vB ? 1 : -1;
        }
      }

      return 0;
    });
  }

  // ...........................................................................
  private _throwOnWrongAddresses(table: Table) {
    const availableAddresses = table.columnSelection.addresses;
    for (const item of Object.values(this._columnSorts)) {
      const address = item.address;
      if (availableAddresses.includes(address) === false) {
        throw new Error(
          `RowFilterProcessor: Error while applying sort to table: ` +
            `There is a sort entry for address "${address}", but the table ` +
            `does not have a column with this address.\n\nAvailable addresses:\n` +
            `${availableAddresses.map((a) => `- ${a}`).join('\n')}`,
        );
      }
    }
  }
}

// #############################################################################
interface _SortItem {
  order: 'asc' | 'desc';
  addressHash: string;

  address: string;
}
