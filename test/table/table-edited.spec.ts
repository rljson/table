// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import {
  Edit,
  exampleEditSetAllEndingWithOTo1234,
  exampleEditSetAllStartingWithOToTrue,
  exampleEditSetAllTrueToDone,
  exampleRowFilter,
  RowFilter,
} from '../../src';
import { EditAction } from '../../src/edit/edit-action';
import { StringFilter } from '../../src/filter/string-filter';
import { TableEdited } from '../../src/table/table-edited';
import { TableWithData } from '../../src/table/table-with-data';

describe('TableEdited', () => {
  const select = (row: any) => [
    row[0],
    row[1],
    row[3],
    row[4]['done'] ? 'done' : 'todo',
  ];

  describe('rows', () => {
    it('returns the edited rows of the original table', () => {
      const original = TableWithData.example();
      const originalData = original.rows.map(select);

      const edited = TableEdited.example;
      const editedData = edited.rows.map(select);

      // For reference show the original table data
      expect(originalData).toEqual([
        ['Zero', 0, false, 'todo'],
        ['OneA', 1, false, 'todo'],
        ['Two', 2, false, 'todo'],
        ['OneB', 11, false, 'todo'],
        ['True', 12, true, 'todo'],
      ]);

      // Check the edited table
      expect(edited.edit.name).toEqual(
        'Set bool to true  and done to true of all items that  ' +
          '1.) end with "o" and  2.) have an int column greater > 1.',
      );

      expect(editedData).toEqual([
        ['Zero', 0, false, 'todo'], // Ends with o is not greater 1
        ['OneA', 1, false, 'todo'],
        ['Two', 2, true, 'done'], // Ends with o and is > 1
        ['OneB', 11, false, 'todo'],
        ['True', 12, true, 'todo'],
      ]);
    });

    describe('returns the original table', () => {
      it('when the array of actions is empty', () => {
        const table = TableWithData.example();
        const edit: Edit = hip({
          name: 'Example Step',
          filter: exampleRowFilter(),
          actions: [],
          _hash: '',
        });

        const tableEdited = new TableEdited(table, edit);
        expect(tableEdited.rows).toBe(table.rows);
      });

      it('when filter does not apply to any row', () => {
        const startsWithXyz: StringFilter = hip({
          _hash: '',
          type: 'string',
          column: 'basicTypes/stringsRef/value',
          operator: 'startsWith',
          search: 'XYZ',
        });

        const filter: RowFilter = hip({
          columnFilters: [startsWithXyz],
          operator: 'and',
          _hash: '',
        });

        const action: EditAction = hip({
          column: 'basicTypes/numbersRef/intsRef/value',
          setValue: 500,
          _hash: '',
        });

        const table = TableWithData.example();
        const edit: Edit = hip({
          _hash: '',
          name: 'Example Step',
          filter: filter,
          actions: [action],
        });
        const tableEdited = new TableEdited(table, edit);
        expect(tableEdited.rows).toBe(table.rows);
      });
    });

    describe('throws an error', () => {
      it('when an action refers to a column that does not exist', () => {
        const table = TableWithData.example();
        const edit: Edit = hip({
          _hash: '',
          name: 'Example Step',
          filter: exampleRowFilter(),
          actions: [
            {
              column: 'nonExistingColumn',
              setValue: 500,
            },
          ],
        });
        expect(() => new TableEdited(table, edit)).toThrowError(
          'TableEdited: Error while applying an Edit to a table: ' +
            'One of the edit actions refers to the column "nonExistingColumn" ' +
            ' that does not exist in the table. ' +
            'Please make sure that alle columns referred in any action ' +
            'are available in the table.',
        );
      });
    });

    describe('apply example edits', () => {
      it('exampleEditSetAllTrueToDone', () => {
        const table = TableWithData.example();
        const edit = exampleEditSetAllTrueToDone();
        const tableEdited = new TableEdited(table, edit);
        const editedData = tableEdited.rows.map(select);

        expect(editedData).toEqual([
          ['Zero', 0, false, 'todo'],
          ['OneA', 1, false, 'todo'],
          ['Two', 2, false, 'todo'],
          ['OneB', 11, false, 'todo'],
          ['True', 12, true, 'done'],
        ]);
      });

      it('exampleEditSetAllStartingWithOToTrue', () => {
        const table = TableWithData.example();
        const edit = exampleEditSetAllStartingWithOToTrue();
        const tableEdited = new TableEdited(table, edit);
        const editedData = tableEdited.rows.map(select);
        expect(editedData).toEqual([
          ['Zero', 0, false, 'todo'],
          ['OneA', 1, true, 'todo'], // Starts with O
          ['Two', 2, false, 'todo'],
          ['OneB', 11, true, 'todo'], // Starts with O
          ['True', 12, true, 'todo'],
        ]);
      });

      it('export const exampleEditSetAllEndingWithOTo1234', () => {
        const table = TableWithData.example();
        const edit = exampleEditSetAllEndingWithOTo1234();
        const tableEdited = new TableEdited(table, edit);
        const editedData = tableEdited.rows.map(select);

        expect(editedData).toEqual([
          ['Zero', 1234, false, 'todo'], // Ends with o
          ['OneA', 1, false, 'todo'],
          ['Two', 1234, false, 'todo'], // Ends with o
          ['OneB', 11, false, 'todo'],
          ['True', 12, true, 'todo'],
        ]);
      });
    });

    describe('rowHashes', () => {
      it('are updated for the edited rows', () => {
        const original = TableWithData.example();
        const edit = exampleEditSetAllTrueToDone();
        const edited = new TableEdited(original, edit);

        let i = 0;
        for (const row of edited.rows) {
          const originalRow = original.rows[i];
          const editedRow = row;

          const originalDone = originalRow[4]['done'] ?? false;
          const editedDone = editedRow[4]['done'] ?? false;

          const originalHash = original.rowHashes[i];
          const editedHash = edited.rowHashes[i];

          if (originalDone !== editedDone) {
            expect(editedHash).not.toBe(originalHash);
          } else {
            expect(editedHash).toBe(originalHash);
          }

          i++;
        }
      });
    });
  });

  it('columnTypes', () => {
    expect(TableEdited.example.columnTypes).toEqual([
      'string',
      'number',
      'number',
      'boolean',
      'json',
      'jsonArray',
      'number',
    ]);
  });
});
