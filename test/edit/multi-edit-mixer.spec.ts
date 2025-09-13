// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  Example,
  MultiEditMixer,
  MultiEditResolved,
  Table,
  TableWithData,
} from '../../src/index.ts';

describe('MultEditMixer', () => {
  let multiEditMixer: MultiEditMixer;
  let masterTable: BehaviorSubject<Table>;
  let multiEdit: BehaviorSubject<MultiEditResolved>;

  beforeAll(() => {
    multiEditMixer = MultiEditMixer.example;
    masterTable = multiEditMixer.masterTable$ as BehaviorSubject<Table>;
    multiEdit = multiEditMixer.multiEdit$ as BehaviorSubject<MultiEditResolved>;

    expect(masterTable).toBeDefined();
  });

  const editedTable = (): Promise<Table> => {
    return firstValueFrom(multiEditMixer.editedTable$);
  };

  it('editedTable', async () => {
    // At the beginning, the edited table is the same as the master table
    let t = await editedTable();
    expect(t._hash).toEqual(TableWithData.example()._hash);
    expect(t.rows.map(Example.select)).toEqual([
      ['Zero', 0, false, 'todo'],
      ['OneA', 1, false, 'todo'],
      ['Two', 2, false, 'todo'],
      ['OneB', 11, false, 'todo'],
      ['True', 12, true, 'todo'],
    ]);

    // Push the first edit. The edited table should change.
    multiEdit.next(MultiEditResolved.exampleStep0);
    t = await editedTable();
    expect(t.rows.map(Example.select)).toEqual([
      ['Zero', 1234, false, 'todo'], // Edited
      ['OneA', 1, false, 'todo'],
      ['Two', 1234, false, 'todo'], // Edited
      ['OneB', 11, false, 'todo'],
      ['True', 12, true, 'todo'],
    ]);

    // Push the second edit. The edited table should change.
    multiEdit.next(MultiEditResolved.exampleStep0and1);
    t = await editedTable();
    expect(t.rows.map(Example.select)).toEqual([
      ['Zero', 1234, false, 'todo'],
      ['OneA', 1, true, 'todo'], // Edited
      ['Two', 1234, false, 'todo'],
      ['OneB', 11, true, 'todo'],
      ['True', 12, true, 'todo'],
    ]);
  });
});
