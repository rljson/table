// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { beforeAll, describe, expect, it } from 'vitest';

import { ColumnSelection } from '../src/column-selection';
import { Example } from '../src/example';

import { expectGolden } from './setup/goldens';

describe('ColumnSelection', () => {
  let selection: ColumnSelection;

  beforeAll(() => {
    selection = ColumnSelection.example();
  });

  it('empty', () => {
    const empty = ColumnSelection.empty();
    expect(empty.columns).toEqual([]);
  });

  describe('fromAddresses', () => {
    describe('fromAddressSegments', () => {
      it('takes the last address segment as alias', () => {
        const selection = ColumnSelection.fromAddresses([
          'a/b/c',
          'd/e/f',
          'h/i/g',
          'h/i/g',
        ]);

        expect(selection.aliases).toEqual(['c', 'f', 'g']);
        expect(selection.addresses).toEqual(['a/b/c', 'd/e/f', 'h/i/g']);
      });

      it('appends a number to the alias if it already exists', () => {
        const selection = ColumnSelection.fromAddresses([
          'a/b/c',
          'd/e/c',
          'f/g/c',
        ]);

        expect(selection.aliases).toEqual(['c', 'c1', 'c2']);
        expect(selection.addresses).toEqual(['a/b/c', 'd/e/c', 'f/g/c']);
      });
    });
  });

  it('addresses', () => {
    expectGolden('column-selection/addresses.json').toBe(selection.addresses);
  });

  describe('address(alias)', () => {
    it('returns the address for the given alias', () => {
      expect(selection.address('stringCol')).toBe(
        'basicTypes/stringsRef/value',
      );

      expect(selection.address('intCol')).toBe(
        'basicTypes/numbersRef/intsRef/value',
      );

      expect(selection.address('floatCol')).toBe(
        'basicTypes/numbersRef/floatsRef/value',
      );
    });

    it('throws an error for an unknown alias', () => {
      expect(() => selection.address('unknown')).toThrowError(
        'Unknown column alias or address: unknown',
      );
    });
  });

  it('addressHashes', () => {
    expectGolden('column-selection/address-hashes.json').toBe(
      selection.addressHashes,
    );
  });

  it('addressSegments', () => {
    expectGolden('column-selection/address-segments.json').toBe(
      selection.addressSegments,
    );
  });

  describe('alias(address))', () => {
    it('returns the alias for the given address', () => {
      expect(selection.alias('basicTypes/stringsRef/value')).toBe('stringCol');
      expect(selection.alias('basicTypes/numbersRef/intsRef/value')).toBe(
        'intCol',
      );
    });

    it('throws an error for an unknown address', () => {
      expect(() =>
        selection.alias('basicTypes/stringsRef/unknown'),
      ).toThrowError(
        'Unknown column alias or address: basicTypes/stringsRef/unknown',
      );
    });
  });

  describe('fromAddressSegments', () => {
    it('takes the last address segment as alias', () => {
      const selection = ColumnSelection.fromAddressSegments([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['h', 'i', 'g'],
      ]);

      expect(selection.addresses).toEqual(['a/b/c', 'd/e/f', 'h/i/g']);
      expect(selection.aliases).toEqual(['c', 'f', 'g']);
    });

    it('appends a number to the alias if it already exists', () => {
      const selection = ColumnSelection.fromAddressSegments([
        ['a', 'b', 'c'],
        ['d', 'e', 'c'],
        ['f', 'g', 'c'],
      ]);

      expect(selection.addresses).toEqual(['a/b/c', 'd/e/c', 'f/g/c']);
      expect(selection.aliases).toEqual(['c', 'c1', 'c2']);
    });
  });

  describe('merge', () => {
    it('merges multiple column selections into one', () => {
      const selection1 = new ColumnSelection([
        { alias: 'a', address: 'a/b/c', titleLong: '', titleShort: '' },
        { alias: 'd', address: 'd/e/f', titleLong: '', titleShort: '' },
      ]);
      const selection2 = new ColumnSelection([
        { alias: 'g', address: 'h/i/g', titleLong: '', titleShort: '' },
        { alias: 'd', address: 'd/e/f', titleLong: '', titleShort: '' },
      ]);
      const selection3 = new ColumnSelection([
        { alias: 'a', address: 'a/b/c', titleLong: '', titleShort: '' },
        { alias: 'h', address: 'h/i/g', titleLong: '', titleShort: '' },
      ]);
      const merged = ColumnSelection.merge([
        selection1,
        selection2,
        selection3,
      ]);
      expect(merged.addresses).toEqual(['a/b/c', 'd/e/f', 'h/i/g']);
      expect(merged.aliases).toEqual(['c', 'f', 'g']);
    });
  });

  it('aliases', () => {
    expectGolden('column-selection/aliases.json').toBe(selection.aliases);
  });

  it('metadata', () => {
    expectGolden('column-selection/title-short.json').toBe(
      selection.metadata('titleShort'),
    );

    expectGolden('column-selection/title-long.json').toBe(
      selection.metadata('titleLong'),
    );
  });

  describe('should throw', () => {
    it('throws when alias is duplicated', () => {
      expect(
        () => new ColumnSelection(Example.columnSelectionBroken()),
      ).toThrow('Duplicate alias: stringCol');
    });
  });

  describe('columnIndex(aliasOrAddress)', () => {
    describe('returns the column index for', () => {
      it('the given alias', () => {
        expect(selection.columnIndex('stringCol')).toBe(0);
        expect(selection.columnIndex('intCol')).toBe(1);
      });

      it('the given address', () => {
        expect(
          selection.columnIndex('basicTypes/numbersRef/intsRef/value'),
        ).toBe(1);

        expect(
          selection.columnIndex('basicTypes/numbersRef/floatsRef/value'),
        ).toBe(2);
      });

      it('the given address segments', () => {
        expect(
          selection.columnIndex(['basicTypes', 'stringsRef', 'value']),
        ).toBe(0);
        expect(
          selection.columnIndex([
            'basicTypes',
            'numbersRef',
            'intsRef',
            'value',
          ]),
        ).toBe(1);
      });

      it('the given address hash', () => {
        const h = ColumnSelection.calcHash;
        expect(
          selection.columnIndex(h('basicTypes/numbersRef/intsRef/value')),
        ).toBe(1);

        expect(
          selection.columnIndex(h('basicTypes/numbersRef/floatsRef/value')),
        ).toBe(2);
      });

      it('the given column index', () => {
        expect(selection.columnIndex(0)).toBe(0);
        expect(selection.columnIndex(1)).toBe(1);
        expect(selection.columnIndex(2)).toBe(2);
      });
    });

    describe('return -1', () => {
      it('not when throwIfNotExisting is false and column is not existing', () => {
        const throwIfNotExisting = true;

        expect(selection.columnIndex('unknown', !throwIfNotExisting)).toBe(-1);
      });
    });

    describe('throws an error for an unknown alias or address', () => {
      it('when throwIfNotExisting is true', () => {
        expect(() => selection.columnIndex('unknown')).toThrowError(
          'Unknown column alias or address: unknown',
        );
      });
    });

    describe('column(aliasAddressOrHash)', () => {
      it('returns the column config for the desired column', () => {
        const result = selection.column('stringCol');
        expectGolden('column-selection/column.json').toBe(result);
      });
    });

    describe('count', () => {
      it('returns the count', () => {
        expect(selection.count).toBe(7);
      });
    });

    describe('check', () => {
      describe('throws an error', () => {
        it('when an alias is upper camel case', () => {
          expect(() =>
            ColumnSelection.check(['ShortTitle'], ['shortTextsDe/shortText']),
          ).toThrowError(
            'Invalid alias "ShortTitle". Aliases must be lower camel case.',
          );
        });

        it('when an address contains special chars', () => {
          expect(() =>
            ColumnSelection.check(
              ['shortTitle'],
              ['shortTextsDe#shortTextsDeRef/shortText$'],
            ),
          ).toThrowError(
            'Invalid address "shortTextsDe#shortTextsDeRef/shortText$". ' +
              'Addresses must only contain letters, numbers and slashes.',
          );
        });

        it('when the parts of an address are not lower camel case strings', () => {
          expect(() =>
            ColumnSelection.check(
              ['shortTitle'],
              ['shortTextsDe/ShortTextsDeRef/shortText'],
            ),
          ).toThrowError(
            'Invalid address segment "ShortTextsDeRef". ' +
              'Address segments must be lower camel case.',
          );
        });

        it('when an address occurs more than once', () => {
          expect(() =>
            ColumnSelection.check(
              ['shortTitle', 'shortTitle2'],
              ['shortTextsDe/shortText', 'shortTextsDe/shortText'],
            ),
          ).toThrowError(
            'Duplicate address shortTextsDe/shortText. ' +
              'A column must only occur once.',
          );
        });
      });
    });

    describe('addedColumns', () => {
      it('returns the missing columns', () => {
        const current = ColumnSelection.fromAddresses([
          'a/b/c',
          'd/e/f',
          'h/i/g',
        ]);

        const previous = ColumnSelection.fromAddresses([
          'k/j/l',
          'd/e/f',
          'x/y/z',
        ]);

        const addedColumns = previous.addedColumns(current);
        expect(addedColumns).toEqual(['k/j/l', 'x/y/z']);
      });
    });
  });
});
