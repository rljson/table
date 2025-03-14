// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { Example } from '../src/example';

import { expectGolden } from './setup/goldens';

describe('Example', () => {
  it('columnSelection', async () => {
    const json = Example.columnSelection();
    expectGolden('example/column-selection/column-selection.json').toBe(json);
  });

  it('columnSelectionBroken', async () => {
    const json = Example.columnSelectionBroken();
    expectGolden('example/column-selection/broken.json').toBe(json);
  });

  it('columnSelectionEmpty', async () => {
    const json = Example.columnSelectionEmpty();
    expectGolden('example/column-selection/empty.json').toBe(json);
  });

  it('tableData', async () => {
    const json = Example.tableData();
    expectGolden('example/table-data/table-data.json').toBe(json);
  });
});
