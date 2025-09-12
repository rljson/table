// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { TableWithData } from '../src/table-with-data';

import { expectGolden } from './setup/goldens';

describe('TableWithData', () => {
  const table = TableWithData.example();

  it('rowCount', () => {
    expect(table.rowCount).toBe(3);
  });

  it('columnCount', () => {
    expect(table.columnCount).toBe(7);
  });

  it('row', () => {
    expectGolden('table-with-data/row-0.json').toBe(table.row(0));
    expectGolden('table-with-data/row-1.json').toBe(table.row(1));
  });

  it('rowIndices', () => {
    expectGolden('table-with-data/row-indices.json').toBe(table.rowIndices);
  });

  it('rowHashes', () => {
    expectGolden('table-with-data/row-hashes.json').toBe(table.rowHashes);
  });

  it('columnTypes', () => {
    expectGolden('table-with-data/column-types.json').toBe(table.columnTypes);
  });

  it('_hash', () => {
    expectGolden('table-with-data/table-hash.json').toBe(table._hash);
  });
});
