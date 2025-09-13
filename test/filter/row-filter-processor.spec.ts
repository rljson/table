// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeEach, describe, expect, it } from 'vitest';

import { exampleRowFilter } from '../../src/filter/row-filter';
import {
  BooleanFilterProcessor,
  ColumnSelection,
  NumberFilterProcessor,
  RowFilterProcessor,
  StringFilterProcessor,
} from '../../src/index.ts';
import { TableWithData } from '../../src/table/table-with-data';

describe('RowFilterProcessor', () => {
  const fa = new NumberFilterProcessor('equals', 42);
  const fb = new StringFilterProcessor('equals', 'foo');
  const fc = new BooleanFilterProcessor('equals', true);
  const fd = new NumberFilterProcessor('equals', 43);

  let a0: RowFilterProcessor;
  let a1: RowFilterProcessor;
  let lessFilters: RowFilterProcessor;
  let changedFilter: RowFilterProcessor;
  let changedOperator: RowFilterProcessor;

  beforeEach(() => {
    const filters = {
      a: fa,
      b: fb,
      c: fc,
    };

    a0 = new RowFilterProcessor(filters, 'and');
    a1 = new RowFilterProcessor(filters, 'and');
    lessFilters = new RowFilterProcessor(
      {
        a: fa,
        b: fb,
      },
      'and',
    );

    changedFilter = new RowFilterProcessor(
      {
        a: fa,
        b: fb,
        c: fd,
      },
      'and',
    );

    changedOperator = new RowFilterProcessor(filters, 'or');
  });

  describe('fromModel', () => {
    it('creates a RowFilterProcessor from a RowFilter model', () => {
      const model = exampleRowFilter();
      const rowFilter = RowFilterProcessor.fromModel(model);
      const processors = rowFilter.processors;

      expect(processors[0]).instanceOf(BooleanFilterProcessor);
      expect(processors[1]).instanceOf(StringFilterProcessor);
      expect(processors[2]).instanceOf(NumberFilterProcessor);
    });
  });

  describe('equals', () => {
    describe('returns true', () => {
      it('when the instances are the same', () => {
        expect(a0.equals(a0)).toBe(true);
      });

      it('when the instances are not the same, but operator and filters', () => {
        expect(a0.equals(a1)).toBe(true);
      });
    });

    describe('returns false', () => {
      it('when the operator changes', () => {
        expect(a0.equals(changedOperator)).toBe(false);
      });

      it('when a filter changes', () => {
        expect(a0.equals(changedFilter)).toBe(false);
      });

      it('when the number of filter changes', () => {
        expect(a0.equals(lessFilters)).toBe(false);
      });

      it('when instantiated with the same but changed object', () => {
        const filters = {
          a: fa,
          b: fb,
          c: fc,
        };

        const filter0 = new RowFilterProcessor(filters, 'and');

        filters.a = fd;
        const filter1 = new RowFilterProcessor(filters, 'and');

        expect(filter0.equals(filter1)).toBe(false);
      });
    });
  });

  describe('applyTo', () => {
    describe('with operator and', () => {
      const and = 'and';

      describe('and no filters', () => {
        describe('and an empty table', () => {
          const noRows = TableWithData.empty();

          it('returns an empty array', () => {
            const filter = RowFilterProcessor.empty;
            expect(filter.applyTo(noRows)).toEqual([]);
          });
        });

        describe('and a table with rows', () => {
          const threeRows: any[][] = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ];

          const table = new TableWithData(
            new ColumnSelection([
              { alias: 'a', address: 'a', titleShort: 'tA', titleLong: 'tlA' },
              { alias: 'b', address: 'b', titleShort: 'tA', titleLong: 'tlA' },
              { alias: 'c', address: 'c', titleShort: 'tA', titleLong: 'tlA' },
            ]),
            threeRows,
          );

          it('returns the unchanged row indices of the table', () => {
            const filter = RowFilterProcessor.empty;
            expect(filter.applyTo(table)).toBe(table.rowIndices);
          });
        });
      });

      describe('and a filter only for the first column', () => {
        const oneFilter = {
          a: new NumberFilterProcessor('equals', 42),
        };

        const threeRows: any[][] = [
          [2, 2, 3],
          [42, 5, 6],
          [7, 42, 9],
          [42, 8, 9],
        ];

        const table = new TableWithData(
          new ColumnSelection([
            { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
            { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
            { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
          ]),
          threeRows,
        );

        it('returns the matching row', () => {
          const filter = new RowFilterProcessor(oneFilter, and);
          expect(filter.applyTo(table)).toEqual([1, 3]);
        });
      });

      describe('and filters for all columns', () => {
        it('returns the rows exactly matching the column filters', () => {
          const filters = {
            a: new NumberFilterProcessor('equals', 42),
            b: new StringFilterProcessor('equals', 'foo'),
            c: new BooleanFilterProcessor('equals', true),
          };

          const threeRows: any[][] = [
            [2, 'bar', false],
            [42, 'foo', true],
            [7, 'foo', true],
            [42, 'foo', false],
            [42, 'foo', true],
          ];

          const table = new TableWithData(
            new ColumnSelection([
              { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
              { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
              { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
            ]),
            threeRows,
          );

          const filter = new RowFilterProcessor(filters, 'and');
          expect(filter.applyTo(table)).toEqual([1, 4]);
        });
      });
    });

    describe('operator or', () => {
      const or = 'or';

      describe('and filters for all columns', () => {
        it('returns the rows matching any column filter', () => {
          const filters = {
            a: new NumberFilterProcessor('equals', 42),
            b: new StringFilterProcessor('startsWith', 'foo'),
            c: new BooleanFilterProcessor('equals', true),
          };

          const threeRows: any[][] = [
            [2, 'bar', false],
            [42, 'fooA', true],
            [7, 'fooB', true],
            [42, 'fooC', false],
            [2, 'xyz', true],
          ];

          const table = new TableWithData(
            new ColumnSelection([
              { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
              { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
              { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
            ]),
            threeRows,
          );

          const filter = new RowFilterProcessor(filters, or);
          expect(filter.applyTo(table)).toEqual([1, 2, 3, 4]);
        });
      });

      describe('and filters for two columns', () => {
        it('returns the rows matching any column filter', () => {
          const filters = {
            a: new NumberFilterProcessor('equals', 42),

            c: new BooleanFilterProcessor('equals', true),
          };

          const threeRows: any[][] = [
            [2, 'bar', false],
            [42, 'fooA', true],
            [7, 'fooB', true],
            [42, 'fooC', false],
            [2, 'xyz', true],
          ];

          const table = new TableWithData(
            new ColumnSelection([
              { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
              { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
              { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
            ]),
            threeRows,
          );

          const filter = new RowFilterProcessor(filters, or);
          expect(filter.applyTo(table)).toEqual([1, 2, 3, 4]);
        });
      });

      describe('and filters only for one of the columns', () => {
        it('returns the rows matching the column filter', () => {
          const filters = {
            b: new StringFilterProcessor('endsWith', 'foo'),
          };

          const threeRows: any[][] = [
            [2, 'bar', false],
            [42, 'fooA', true],
            [7, 'bFoo', true],
            [42, 'foo', false],
            [2, 'xyz', true],
          ];

          const table = new TableWithData(
            new ColumnSelection([
              { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
              { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
              { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
            ]),
            threeRows,
          );

          const filter = new RowFilterProcessor(filters, or);
          expect(filter.applyTo(table)).toEqual([2, 3]);
        });
      });
    });

    describe('throws', () => {
      it('when the filters contain a column that is not in the table', () => {
        const filters = {
          a: new NumberFilterProcessor('equals', 42),
          b: new StringFilterProcessor('equals', 'foo'),
          c: new BooleanFilterProcessor('equals', true),
          d: new NumberFilterProcessor('equals', 43),
        };

        const threeRows: any[][] = [
          [2, 'bar', false],
          [42, 'foo', true],
          [7, 'foo', true],
          [42, 'foo', false],
          [42, 'foo', true],
        ];

        const table = new TableWithData(
          new ColumnSelection([
            { alias: 'a', address: 'a', titleShort: 'tsA', titleLong: 'tsA' },
            { alias: 'b', address: 'b', titleShort: 'tsB', titleLong: 'tsB' },
            { alias: 'c', address: 'c', titleShort: 'tsC', titleLong: 'tsC' },
          ]),
          threeRows,
        );

        const filter = new RowFilterProcessor(filters, 'and');

        expect(() => filter.applyTo(table)).toThrow(
          'RowFilterProcessor: Error while applying filter to table: ' +
            'There is a column filter for address "d", ' +
            'but the table does not have a column with this address.',
        );
      });
    });
  });
});
