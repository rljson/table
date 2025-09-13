// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Hash, hip } from '@rljson/hash';
import { JsonValueType } from '@rljson/json';

import {
  Edit,
  EditAction,
  NumberFilter,
  RowFilterProcessor,
  StringFilter,
  Table,
  TableWithData,
} from '../index.ts';

/**
 * An table with an Edit applied to.
 */
export class TableEdited extends Table {
  /**
   * Constructor
   * @param table The table to be edited
   * @param edit The edit to be applied to the table
   */
  constructor(table: Table, public readonly edit: Edit) {
    super(table.columnSelection);
    this._actions = this._initActions;
    this._applyEdit(table);
    this._updateRowHashes(table);
    this.columnTypes = table.columnTypes;
  }

  /**
   * The rows of the table.
   */
  get rows() {
    return this._rows;
  }

  /**
   * The column types of the table.
   */
  columnTypes: JsonValueType[];

  static get example(): TableEdited {
    return TableEdited._example;
  }

  // ######################
  // Protected
  // ######################

  protected _updateRowHashes(table: Table) {
    this._rowHashes = [...table.rowHashes];
    for (const i of this._editedRows) {
      const row = this._rows[i];
      this._rowHashes[i] = Hash.default.calcHash(row);
    }
  }

  // ######################
  // Private
  // ######################

  private _rows: any[][] = [];
  private _actions: _EditActionWithIndex[];
  private _editedRows: number[] = [];

  private _applyEdit(table: Table) {
    const rows = table.rows;

    // If edit actions are empty, the table is not changed
    if (this.edit.actions.length === 0) {
      this._rows = rows;
      return;
    }

    // Create a filter processor from the edit
    const rowFilter = RowFilterProcessor.fromModel(this.edit.filter);

    // Get the rows matching the filter
    const matchingRows = rowFilter.applyTo(table);

    // No rows match the filter? Keep the unchanged table.
    if (matchingRows.length === 0) {
      this._rows = rows;
      return;
    }

    // Get column indices for the edit actions

    // Create a copy of all rows
    const result = [...rows];

    // Iterate all matching rows and apply the edit actions
    for (const i of matchingRows) {
      const originalRow = result[i];
      const processedRow = this._applyActions(originalRow);
      result[i] = processedRow;
    }

    this._editedRows = matchingRows;

    this._rows = result;
  }

  // ...........................................................................
  private _applyActions(row: any[]): any[] {
    const result = [...row];

    for (const action of this._actions) {
      result[action.index] = action.setValue;
    }
    return result;
  }

  // ...........................................................................
  private get _initActions(): _EditActionWithIndex[] {
    const cs = this.columnSelection;

    const result = this.edit.actions.map((action) => {
      const column = action.column;
      const index = cs.columnIndex(column, false);
      if (index === -1) {
        this._throwColumnNotFoundError(column);
      }

      return {
        ...action,
        index,
      };
    });

    return result;
  }

  // ...........................................................................
  private _throwColumnNotFoundError(column: string) {
    throw new Error(
      `TableEdited: Error while applying an Edit to a table: ` +
        `One of the edit actions refers to the column "${column}" ` +
        ` that does not exist in the table. ` +
        `Please make sure that alle columns referred in any action ` +
        `are available in the table.`,
    );
  }

  // ...........................................................................
  static get _example() {
    const table = TableWithData.example();
    const stringEndsWithO: StringFilter = hip({
      _hash: '',
      type: 'string',
      column: 'basicTypes/stringsRef/value',
      operator: 'endsWith',
      search: 'o',
    });

    const intIsGreater1: NumberFilter = hip({
      _hash: '',
      type: 'number',
      column: 'basicTypes/numbersRef/intsRef/value',
      operator: 'greaterThan',
      search: 1,
    });

    const edit: Edit = hip<Edit>({
      _hash: '',
      name: [
        'Set bool to true ',
        'and done to true',
        'of all items that ',
        '1.) end with "o" and ',
        '2.) have an int column greater > 1.',
      ].join(' '),
      filter: {
        _hash: '',
        operator: 'and',
        columnFilters: [stringEndsWithO, intIsGreater1],
      },
      actions: [
        {
          _hash: '',
          column: 'basicTypes/booleansRef/value',
          setValue: true,
        },
        {
          _hash: '',
          column: 'complexTypes/jsonObjectsRef/value',
          setValue: { done: true },
        },
      ],
    });

    return new TableEdited(table, edit);
  }
}

/// An edit action with the column index
interface _EditActionWithIndex extends EditAction {
  index: number;
}
