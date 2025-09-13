// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { MultiEditResolved } from '../edit/multi-edit-resolved.ts';

import { TableCache } from './table-cache.ts';
import { TableEdited } from './table-edited.ts';
import { TableWithData } from './table-with-data.ts';
import { Table } from './table.ts';

/**
 * An table with multiple edits applied to it.
 */
export class TableEditedMultiple extends Table {
  /**
   * Constructor
   * @param master The master table to which the multiEdit is applied
   * @param multiEdit The multiEdit to be applied to the table
   * @param cache The cache to be used
   */
  constructor(
    master: Table,
    public readonly multiEdit: MultiEditResolved,
    public readonly cache: TableCache = new TableCache(1),
  ) {
    super(master.columnSelection);
    this._applyMultiEdit(master);
    this._updateAllRowHashes();
    this.columnTypes = master.columnTypes;
  }

  // ...........................................................................
  get rows() {
    return this._rows;
  }

  /**
   * The column types of the table.
   */
  columnTypes: JsonValueType[];

  // ...........................................................................
  static get example(): TableEditedMultiple {
    // Get the master table
    const masterTable = TableWithData.example();

    const multiEdit = MultiEditResolved.example;

    // Create and return the result object
    const result = new TableEditedMultiple(masterTable, multiEdit);
    return result;
  }

  editCount = 0;

  // ######################
  // Protected
  // ######################

  // ...........................................................................
  /* v8 ignore start */
  protected _updateRowHashes(): void {
    // Hashes are already updated within _applyMultiEdit
  }
  /* v8 ignore stop */

  // ######################
  // Private
  // ######################

  private _rows: any[][] = [];

  private _applyMultiEdit(master: Table) {
    // If edits are empty, return the table as is
    const isEmpty =
      !this.multiEdit.previous && this.multiEdit.edit.actions.length === 0;

    if (isEmpty) {
      this._rows = master.rows;
      return;
    }

    // Create a list of edits to be applied
    const edits = this._editChain(master);

    // Apply the edits to the table
    let resultTable: Table = master;
    let cachedResult: Table | undefined = this.cache.get(master, edits[0]);

    for (const edit of edits) {
      resultTable = cachedResult ?? new TableEdited(resultTable, edit.edit);
      if (!cachedResult) {
        this.cache.set(master, edit, resultTable);
        this.editCount++;
      }
      cachedResult = undefined;
    }

    // Take the result table as the final table
    this._rows = resultTable.rows;
    this._rowHashes = resultTable.rowHashes;
  }

  // ...........................................................................
  private _editChain(master: Table): MultiEditResolved[] {
    const result: MultiEditResolved[] = [];

    // Start with the head and follow the chain
    let current: MultiEditResolved | undefined = this.multiEdit;
    while (current) {
      result.push(current);

      // If a cached item is available, we don't need to follow the chain
      if (this.cache.get(master, current)) {
        break;
      }

      // Move to the previous item
      current = current.previous;
    }

    // Return the result in reverse order
    return result.reverse();
  }
}
