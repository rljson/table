// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { ColumnInfo, ColumnsConfig } from './columns-config.ts';

export class Example {
  static columnsConfig() {
    return new ColumnsConfig([
      {
        alias: 'stringCol',
        address: 'basicTypes/stringsRef/value',
        type: 'string',
        titleLong: 'String values',
        titleShort: 'Strings',
      },
      {
        alias: 'intCol',
        address: 'basicTypes/numbersRef/intsRef/value',
        type: 'number',
        titleLong: 'Int values',
        titleShort: 'Ints',
      },
      {
        alias: 'floatCol',
        address: 'basicTypes/numbersRef/floatsRef/value',
        type: 'number',
        titleLong: 'Float values',
        titleShort: 'Floats',
      },
      {
        alias: 'nullCol',
        address: 'basicTypes/nullsRef/value',
        type: 'null',
        titleLong: 'Null values',
        titleShort: 'Nulls',
      },
      {
        alias: 'booleanCol',
        address: 'basicTypes/booleansRef/value',
        type: 'boolean',
        titleLong: 'Boolean values',
        titleShort: 'Booleans',
      },
      {
        alias: 'jsonObjectCol',
        address: 'complexTypes/jsonObjectsRef/value',
        type: 'json',
        titleLong: 'Json objects',
        titleShort: 'JO',
      },
      {
        alias: 'jsonArrayCol',
        address: 'complexTypes/jsonArraysRef/value',
        type: 'jsonArray',
        titleLong: 'Array values',
        titleShort: 'JA',
      },
      {
        alias: 'jsonValueCol',
        address: 'complexTypes/jsonValuesRef/value',
        type: 'jsonValue',
        titleLong: 'Json values',
        titleShort: 'JV',
      },
    ]);
  }
  static columnsConfigBroken(): ColumnInfo[] {
    return [
      {
        alias: 'stringCol',
        address: 'basicTypes/stringsRef/value',
        type: 'string',
        titleLong: 'String values',
        titleShort: 'Strings',
      },
      {
        alias: 'stringCol', // ⚠️ Duplicate alias
        address: 'basicTypes/stringsRef/value',
        type: 'string',
        titleLong: 'String values',
        titleShort: 'Strings',
      },
    ];
  }

  static columnsConfigEmpty() {
    return new ColumnsConfig([]);
  }

  static tableData() {
    return [
      ['Zero', 0, 0.01, null, false, { a: { b: 0 } }, [0, 1, [2, 3]], 0],
      ['One', 1, 1.01, null, true, { a: { b: 1 } }, [1, 2, [3, 4]], 'One'],
      ['Two', 2, 2.02, null, false, { a: { b: 2 } }, [2, 3, [4, 5]], { a: 2 }],
    ];
  }
}
