// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { Example } from '../src/example';

import { expectGolden } from './setup/goldens';

describe('Example', () => {
  it('columnsConfig', async () => {
    const json = Example.columnsConfig();
    expectGolden('example/columns-config/columns-config.json').toBe(json);
  });

  it('columnsConfigBroken', async () => {
    const json = Example.columnsConfigBroken();
    expectGolden('example/columns-config/broken.json').toBe(json);
  });

  it('columnsConfigEmpty', async () => {
    const json = Example.columnsConfigEmpty();
    expectGolden('example/columns-config/empty.json').toBe(json);
  });

  it('tableData', async () => {
    const json = Example.tableData();
    expectGolden('example/table-data/table-data.json').toBe(json);
  });
});
