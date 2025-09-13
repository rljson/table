// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeAll, describe, expect, it } from 'vitest';

import { TableEmpty } from '../../src/index.ts';

describe('TableEmpty', () => {
  let tableEmpty: TableEmpty;

  beforeAll(() => {
    tableEmpty = new TableEmpty();
  });

  it('example', () => {
    expect(TableEmpty.example).toBeDefined();
  });

  describe('rows', () => {
    it('returns an empty array', () => {
      expect(tableEmpty.rows).toEqual([]);
    });
  });

  describe('rowCount', () => {
    it('returns 0', () => {
      expect(tableEmpty.rowCount).toBe(0);
    });
  });

  describe('columnCount', () => {
    it('returns 0', () => {
      expect(tableEmpty.columnCount).toBe(0);
    });
  });

  describe('_hash', () => {
    it('returns an empty string', () => {
      expect(tableEmpty._hash).toBe('blnGkibzshLf9iIxFoUWhj');
    });
  });
});
