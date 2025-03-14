// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Table } from '../src/table';


describe('Table', () => {
  it('should validate a table', () => {
    const table = Table.example;
    expect(table).toBeDefined();
  });
});
