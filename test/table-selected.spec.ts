// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { TableSelected } from '../src/table-selected';

describe('TableSelected', () => {
  const tableSelected = TableSelected.example;

  describe('row', () => {
    it('returns the row data for the given index', () => {
      expect(tableSelected.rows).toEqual([
        ['Zero', 0],
        ['One', 1],
        ['Two', 2],
      ]);
    });
  });

  describe('rowCount', () => {
    it('returns the number of rows in the view', () => {
      expect(tableSelected.rowCount).toBe(3);
    });
  });

  describe('rowIndices', () => {
    it('returns the row indices of the view', () => {
      expect(tableSelected.rowIndices).toEqual([0, 1, 2]);
    });
  });

  describe('value(row, col)', () => {
    it('returns the value of the cell at the given row and column', () => {
      expect(tableSelected.value(0, 0)).toBe('Zero');
      expect(tableSelected.value(0, 1)).toBe(0);
      expect(tableSelected.value(1, 0)).toBe('One');
      expect(tableSelected.value(1, 1)).toBe(1);
      expect(tableSelected.value(2, 0)).toBe('Two');
      expect(tableSelected.value(2, 1)).toBe(2);
    });
  });

  it('columnTypes', () => {
    expect(TableSelected.example.columnTypes).toEqual(['string', 'number']);
  });
});
