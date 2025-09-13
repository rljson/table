// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeEach, describe, expect, it } from 'vitest';

import { RowSort, TableSelected, TableSorted } from '../../src';

describe('TableSorted', () => {
  describe('wth an empty filter', () => {
    let original: TableSelected;
    let sorted: TableSorted;

    beforeEach(() => {
      original = TableSelected.example;
      sorted = new TableSorted(original, RowSort.empty);
    });

    describe('example', () => {
      it('without params', () => {
        const e = TableSorted.example();
        expect(e.rows).toEqual([
          ['OneB', 11],
          ['Two', 2],
          ['OneA', 1],
          ['Zero', 0],
        ]);
      });
    });

    describe('row', () => {
      it('returns the row data for the given index', () => {
        for (let i = 0; i < original.rowCount; i++) {
          expect(sorted.row(i)).toEqual(original.row(i));
        }
      });
    });

    it('rows', () => {
      expect(sorted.rows).toBe(original.rows);
    });

    describe('rowCount', () => {
      it('returns the number of rows in the view', () => {
        expect(sorted.rowCount).toBe(original.rowCount);
      });
    });

    describe('rowIndices', () => {
      it('returns the row indices of the view', () => {
        expect(sorted.rowIndices).toEqual([0, 1, 2, 3]);
      });
    });

    describe('value(row, col)', () => {
      it('returns the value of the cell at the given row and column', () => {
        for (let i = 0; i < original.rowCount; i++) {
          for (let j = 0; j < original.columnCount; j++) {
            expect(sorted.value(i, j)).toBe(original.value(i, j));
          }
        }
      });
    });
  });

  describe('with sort', () => {
    let sortedDesc: TableSorted;
    let sortedAsc: TableSorted;

    beforeEach(() => {
      sortedDesc = TableSorted.example(
        new RowSort({ 'basicTypes/numbersRef/intsRef/value': 'desc' }),
      );

      sortedAsc = TableSorted.example(
        new RowSort({ 'basicTypes/numbersRef/intsRef/value': 'asc' }),
      );
    });

    describe('row', () => {
      it('returns the sorted row data for the given index', () => {
        expect(sortedDesc.row(0)).toEqual(['OneB', 11]);
        expect(sortedDesc.row(1)).toEqual(['Two', 2]);
        expect(sortedDesc.row(2)).toEqual(['OneA', 1]);
        expect(sortedDesc.row(3)).toEqual(['Zero', 0]);

        expect(sortedAsc.row(0)).toEqual(['Zero', 0]);
        expect(sortedAsc.row(1)).toEqual(['OneA', 1]);
        expect(sortedAsc.row(2)).toEqual(['Two', 2]);
        expect(sortedAsc.row(3)).toEqual(['OneB', 11]);
      });
    });

    describe('rowHashes', () => {
      it('should be the same as the original table', () => {
        const sort = new RowSort({
          'basicTypes/numbersRef/intsRef/value': 'asc',
        });
        const original = TableSelected.example;
        const sorted = new TableSorted(original, sort);

        let i = 0;
        for (const row of sorted.rows) {
          const originalIndex = original.rows.indexOf(row);
          const originalHash = original.rowHashes[originalIndex];
          const ownHash = sorted.rowHashes[i];
          expect(ownHash).toBe(originalHash);
          i++;
        }
      });
    });
  });

  it('columnTypes', () => {
    const sort = new RowSort({ 'basicTypes/numbersRef/intsRef/value': 'asc' });
    const original = TableSelected.example;
    const sorted = new TableSorted(original, sort);
    expect(original.columnTypes).toEqual(sorted.columnTypes);
  });
});
