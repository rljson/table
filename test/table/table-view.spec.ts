// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ColumnSelection, RowSort, StringFilter } from '../../src';
import { RowFilter } from '../../src/filter/row-filter';
import { Table } from '../../src/table/table';
import { TableView } from '../../src/table/table-view';
import { TableWithData } from '../../src/table/table-with-data';

describe('TableView', () => {
  let tableView: TableView;

  // Input data
  let masterTable: BehaviorSubject<Table>;
  let columnSelection: BehaviorSubject<ColumnSelection>;
  let filter: BehaviorSubject<RowFilter>;
  let sort: BehaviorSubject<RowSort>;
  let errors: any[] = [];

  beforeEach(() => {
    errors = [];
    tableView = TableView.example((error): void => {
      errors.push(error);
    });
    masterTable = tableView.masterTable$ as BehaviorSubject<Table>;
    columnSelection =
      tableView.columnSelection$ as BehaviorSubject<ColumnSelection>;
    filter = tableView.filter$ as BehaviorSubject<RowFilter>;
    sort = tableView.sort$ as BehaviorSubject<RowSort>;
  });

  describe('dispose()', () => {
    it('calls onDispose', () => {
      let disposedView: TableView | null = null;

      const onDispose = (tableView: TableView) => {
        disposedView = tableView;
      };

      const tableView1 = new TableView(
        tableView.masterTable$,
        tableView.columnSelection$,
        tableView.filter$,
        tableView.sort$,
        onDispose,
      );

      tableView1.dispose();
      expect(disposedView).toBe(tableView1);
    });
  });

  describe('table', () => {
    it('is updated when master table, column selection, filter or sort change', async () => {
      // Initially no filter and sort is applied, and all columns are selected
      let table = await firstValueFrom(tableView.table);
      expect(table.rows).toEqual([
        [
          'Zero',
          0,
          0.01,
          false,
          {
            _hash: '7nnKrH6KoTEC3e9xxliBiP',
            a: {
              _hash: '9Iao-QHCqda6NiJKtRDGx4',
              b: 0,
            },
          },
          [0, 1, [2, 3]],
          0,
        ],
        [
          'OneA',
          1,
          1.01,
          false,
          {
            _hash: 'aGyCrR_fCrzMa6oP_6N50z',
            a: {
              _hash: '647TzLUCMJO1b0kKRlAeiN',
              b: 1,
            },
          },
          [1, 2, [3, 4]],
          'OneA',
        ],
        [
          'Two',
          2,
          2.02,
          false,
          {
            _hash: 'fryoUHLYrdlumjdozOJR0G',
            a: {
              _hash: 'CrGm05TNMBlfBkK2euEYDD',
              b: 2,
            },
          },
          [2, 3, [4, 5]],
          {
            _hash: 'foBZ9JVYn82YEjLMEdALAN',
            a: 2,
          },
        ],
        [
          'OneB',
          11,
          11.01,
          false,
          {
            _hash: 'ap4-YEnJA9ZqfJEu1Ma2Am',
            a: {
              _hash: 'y-ZJyvmx49eS3YoRFL9nMG',
              b: 11,
            },
          },
          [1, 2, [3, 4]],
          'OneB',
        ],

        [
          'True',
          12,
          12.1,
          true,
          {
            _hash: 'ap4-YEnJA9ZqfJEu1Ma2Am',
            a: {
              _hash: 'y-ZJyvmx49eS3YoRFL9nMG',
              b: 11,
            },
          },
          [1, 2, [3, 4]],
          'True',
        ],
      ]);

      // Select columns
      columnSelection.next(
        new ColumnSelection([
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
        ]),
      );

      table = await firstValueFrom(tableView.table);
      expect(table.rows).toEqual([
        ['Zero', 0],
        ['OneA', 1],
        ['Two', 2],
        ['OneB', 11],
        ['True', 12],
      ]);

      // Filter rows
      const stringFilter: StringFilter = hip({
        type: 'string',
        operator: 'startsWith',
        search: 'O',
        _hash: '',
        column: 'basicTypes/stringsRef/value',
      });

      const rowFilter: RowFilter = hip({
        columnFilters: [stringFilter],
        operator: 'and',
        _hash: '',
      });

      filter.next(rowFilter);

      table = await firstValueFrom(tableView.table);
      expect(table.rows).toEqual([
        ['OneA', 1],
        ['OneB', 11],
      ]);

      // Sort rows
      sort.next(new RowSort({ 'basicTypes/stringsRef/value': 'asc' }));

      table = await firstValueFrom(tableView.table);
      expect(table.rows).toEqual([
        ['OneA', 1],
        ['OneB', 11],
      ]);

      // Change master table data
      masterTable.next(
        new TableWithData(masterTable.value.columnSelection, [
          ['Zero', 0, 0.01, false, { a: { b: 0 } }, [0, 1, [2, 3]], 0],
          ['OneA', 1, 1.01, true, { a: { b: 1 } }, [1, 2, [3, 4]], 'OneA'],
          ['Two', 2, 2.02, false, { a: { b: 2 } }, [2, 3, [4, 5]], { a: 2 }],
          ['OneB', 11, 11.01, true, { a: { b: 11 } }, [1, 2, [3, 4]], 'OneB'],
          ['OneD', 13, 13.01, true, { a: { b: 11 } }, [1, 2, [3, 4]], 'OneD'],
          ['OneC', 12, 12.01, true, { a: { b: 11 } }, [1, 2, [3, 4]], 'OneC'],
        ]),
      );

      // View will still output sorted data
      table = await firstValueFrom(tableView.table);

      expect(table.rows).toEqual([
        ['OneA', 1],
        ['OneB', 11],
        ['OneC', 12],
        ['OneD', 13],
      ]);
    });

    it(
      'is not updated as long not all selected columns ' +
        'are available in the master table',
      async () => {
        // Get the current table
        const table = await firstValueFrom(tableView.table);
        expect(table.columnSelection.addresses).toEqual([
          'basicTypes/stringsRef/value',
          'basicTypes/numbersRef/intsRef/value',
          'basicTypes/numbersRef/floatsRef/value',
          'basicTypes/booleansRef/value',
          'complexTypes/jsonObjectsRef/value',
          'complexTypes/jsonArraysRef/value',
          'complexTypes/jsonValuesRef/value',
        ]);

        // Now add another column to the views column selection
        // that is not yet available in the master table

        columnSelection.next(
          new ColumnSelection([
            ...columnSelection.value.columns,
            {
              alias: 'ac',
              address: 'additionalCol',
              type: 'string',
              titleLong: 'Additional Column',
              titleShort: 'Add',
            },
          ]),
        );

        // Listen to the change in order to trigger the pipeline
        firstValueFrom(tableView.table).then(() => {});

        // Wait a bit to make sure the table is not updated
        await new Promise((resolve) => setTimeout(resolve, 1));

        // No error happens because with _hasMissingColumns we make sure
        // the chain is not processed as long as not all selected columns are
        // available in the master table
        expect(errors.length).toBe(0);

        const newMasterTable = new TableWithData(columnSelection.value, [
          [
            'Additional',
            0,
            0.01,
            false,
            { a: { b: 0 } },
            [0, 1, [2, 3]],
            0,
            'additional',
          ],
        ] as any[]);

        masterTable.next(newMasterTable);

        const newTable = await firstValueFrom(tableView.table);
        expect(newTable.columnSelection.addresses).toEqual([
          'basicTypes/stringsRef/value',
          'basicTypes/numbersRef/intsRef/value',
          'basicTypes/numbersRef/floatsRef/value',
          'basicTypes/booleansRef/value',
          'complexTypes/jsonObjectsRef/value',
          'complexTypes/jsonArraysRef/value',
          'complexTypes/jsonValuesRef/value',
          'additionalCol',
        ]);

        expect(newTable.rows).toEqual([
          [
            'Additional',
            0,
            0.01,
            false,
            {
              _hash: '7nnKrH6KoTEC3e9xxliBiP',
              a: {
                _hash: '9Iao-QHCqda6NiJKtRDGx4',
                b: 0,
              },
            },
            [0, 1, [2, 3]],
            0,
            'additional',
          ],
        ]);
      },
    );

    it('reports an error when a missing column is not available after 300ms', async () => {
      vi.useFakeTimers();

      // Select a column that is not available in the master table
      columnSelection.next(
        new ColumnSelection([
          ...columnSelection.value.columns,
          {
            alias: 'ac',
            address: 'additionalCol',
            type: 'string',
            titleLong: 'Additional Column',
            titleShort: 'Add',
          },
        ]),
      );

      firstValueFrom(tableView.table).then(() => {});

      // After 250ms no error is reported
      vi.advanceTimersByTime(250);
      expect(errors).toEqual([]);

      // After 300ms an error is reported
      vi.advanceTimersByTime(51);
      expect(errors).toEqual([
        'Warning: Could not apply column selection to master table: ' +
          'The following columns are missing: additionalCol',
      ]);
    });
  });

  describe('complete coverage', () => {
    it('with different error handler configurations', () => {
      const tableView = TableView.example();
      expect(tableView).toBeInstanceOf(TableView);
      tableView.errorHandler('error');
    });
  });
});
