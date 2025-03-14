// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonValueType } from '@rljson/json';

import { beforeAll, describe, expect, it } from 'vitest';

import { ColumnsConfig } from '../src/columns-config';
import { Table } from '../src/table';
import { TableWithData } from '../src/table-with-data';

import { expectGolden } from './setup/goldens';

describe('Table', () => {
  const table = TableWithData.example();

  it('rowCount', () => {
    expect(table.rowCount).toBe(3);
  });

  it('columnCount', () => {
    expect(table.columnCount).toBe(8);
  });

  it('row', () => {
    expectGolden('table/row.json').toBe(table.row(0));
  });

  it('value', () => {
    expect(table.value(0, 0)).toBe('Zero');
    expect(table.value(1, 0)).toBe('One');
    expect(table.value(2, 0)).toBe('Two');

    expect(table.value(0, 1)).toBe(0);
    expect(table.value(1, 1)).toBe(1);
    expect(table.value(2, 1)).toBe(2);
  });

  describe('check', () => {
    it('throws when row cell count does not match column count', () => {
      let message = '';

      try {
        new TableWithData(ColumnsConfig.example(), [
          ['Three', 3], // Too less columns
          ['Four', 4],
        ]);
      } catch (e) {
        message = e.message;
      }

      expect(message).toBe(
        'Number of columns in data and in columnsConfig do not match: ' +
          'Column count in "columnsConfig" is "8" and in row "0" is "2".',
      );
    });
  });

  describe('rowHashes()', () => {
    it('are provided for each row', () => {
      expectGolden('table/row-hashes.json').toBe(table.rowHashes);
    });

    it('throws when called before the row hashes are calculated', () => {
      const table = TableWithData.example();
      (table as any)._rowHashes = [];

      let message = '';
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        table.rowHashes;
      } catch (e) {
        message = e.message;
      }

      expect(message).toBe(
        'Row hashes have not been calculated yet. ' +
          'Please make sure _rowHashes contains a valid hash for each row. ' +
          'Use _updateAllRowHashes() or write an optimized row hash calc method.',
      );
    });
  });

  describe('calcColumnTypes()', () => {
    it('returns an empty array when no rows are provided', () => {
      const table = TableWithData.empty();
      expect(table.columnTypes).toEqual([]);
    });

    describe('with deep', () => {
      let columnsConfig: ColumnsConfig;
      const deep = true;
      let result: JsonValueType[];

      beforeAll(() => {
        columnsConfig = ColumnsConfig.example();
        const table = TableWithData.example();
        result = Table.calcColumnTypes(table.rows, deep);
      });
      describe('== true', () => {
        it('returns an empty array when the rows contains no cells', () => {
          const table = new TableWithData(ColumnsConfig.empty(), [[]]);
          expect(table.columnTypes).toEqual([]);
        });

        it('returns the types collected from the various rows', () => {
          expect(result).toEqual([
            'string',
            'number',
            'number',
            'jsonValue',
            'boolean',
            'json',
            'jsonArray',
            'jsonValue',
          ]);
        });

        it('returns "jsonValue" if a column contains more then one type', () => {
          expect(result[7]).toBe('jsonValue');
        });

        it('returns JsonValue if a column contains only null values', () => {
          const table = new TableWithData(columnsConfig, [
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
          ]);
          expect(Table.calcColumnTypes(table.rows, deep)).toEqual([
            'jsonValue',
            'jsonValue',
            'jsonValue',
            'jsonValue',
            'jsonValue',
            'jsonValue',
            'jsonValue',
            'jsonValue',
          ]);
        });
      });

      describe('== false', () => {
        it('breaks if at least one type is found for each column', () => {
          const table = TableWithData.example();
          expect(Table.calcColumnTypes(table.rows, !deep)).toEqual([
            'string',
            'number',
            'number',
            'jsonValue',
            'boolean',
            'json',
            'jsonArray',
            'jsonValue',
          ]);
        });
      });
    });
  });
});
