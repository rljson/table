// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { ColumnSelection } from '../index.ts';

import { Table } from './table.ts';

export class TableEmpty extends Table {
  constructor() {
    super(ColumnSelection.empty());
  }

  get rows(): any[][] {
    return [];
  }

  columnTypes: JsonValueType[] = [];

  /* v8 ignore start */
  protected _updateRowHashes(): void {
    this._rowHashes = [];
  }
  /* v8 ignore stop */

  static get example(): TableEmpty {
    return new TableEmpty();
  }
}
