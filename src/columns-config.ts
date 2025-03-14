// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Hash, hip } from '@rljson/hash';
import { JsonValueType } from '@rljson/json';

import { Example } from './example.ts';

export type ColumnAddress = string | string[] | number;

export interface ColumnInfo {
  alias: string;
  address: string;
  type?: JsonValueType;
  value?: any;
  titleLong: string;
  titleShort: string;
  [key: string]: any;
}

export class ColumnsConfig {
  constructor(columns: ColumnInfo[]) {
    this._throwOnWrongAlias(columns);

    this.addresses = columns.map((column) => column.address);
    this.aliases = columns.map((column) => column.alias);
    this.addressHashes = this.addresses.map(ColumnsConfig.calcHash);
    this.addressSegments = this.addresses.map((value) => value.split('/'));
    this.columns = this._initColumns(columns);

    ColumnsConfig.check(this.aliases, this.addresses);
  }

  static example(): ColumnsConfig {
    return Example.columnsConfig();
  }

  // ...........................................................................
  static empty(): ColumnsConfig {
    return Example.columnsConfigEmpty();
  }

  // ...........................................................................
  /**
   * Returns a ColumnsConfig from a list of address segments
   * @param addressSegmentsList - A list of address segments
   * @returns A ColumnsConfig object
   */
  static fromAddressSegments(addressSegmentsList: string[][]): ColumnsConfig {
    const definition: ColumnInfo[] = [];
    const aliasCountMap: Record<string, number> = {};

    for (const segments of addressSegmentsList) {
      const alias = segments[segments.length - 1];
      let uniqueAlias = alias;
      const aliasCount = aliasCountMap[alias] ?? 0;
      if (aliasCount > 0) {
        uniqueAlias = `${alias}${aliasCount}`;
      }
      aliasCountMap[alias] = aliasCount + 1;

      definition.push({
        alias: uniqueAlias,
        address: segments.join('/'),
        titleLong: '',
        titleShort: '',
      });
    }

    return new ColumnsConfig(definition);
  }

  // ...........................................................................
  static fromAddresses(addresses: string[]): ColumnsConfig {
    const addressesSplitted = Array.from(new Set(addresses)).map((address) =>
      address.split('/'),
    );
    return ColumnsConfig.fromAddressSegments(addressesSplitted);
  }

  // ...........................................................................
  readonly columns: ColumnInfo[];
  readonly addresses: string[];
  readonly aliases: string[];

  readonly addressHashes: string[];
  readonly addressSegments: string[][];

  metadata(key: string): any[] {
    return this.columns.map((column) => column[key]);
  }

  // ...........................................................................
  static merge(columnsConfigs: ColumnsConfig[]): ColumnsConfig {
    const addresses = columnsConfigs
      .map((selection) => selection.addresses)
      .flat();

    const addressesWithoutDuplicates = Array.from(new Set(addresses));
    return ColumnsConfig.fromAddresses(addressesWithoutDuplicates);
  }

  // ...........................................................................
  static calcHash(str: string): string {
    return Hash.default.calcHash(str);
  }

  address(aliasAddressOrHash: ColumnAddress): string {
    return this.column(aliasAddressOrHash).address;
  }

  // ...........................................................................
  alias(aliasAddressOrHash: ColumnAddress): string {
    return this.column(aliasAddressOrHash).alias;
  }

  // ...........................................................................
  columnIndex(
    hashAliasOrAddress: ColumnAddress,
    throwIfNotExisting: boolean = true,
  ): number {
    if (typeof hashAliasOrAddress === 'number') {
      return hashAliasOrAddress;
    }

    const str = Array.isArray(hashAliasOrAddress)
      ? hashAliasOrAddress.join('/')
      : hashAliasOrAddress;

    const hashIndex = this.addressHashes.indexOf(str);
    if (hashIndex >= 0) {
      return hashIndex;
    }

    const aliasIndex = this.aliases.indexOf(str);
    if (aliasIndex >= 0) {
      return aliasIndex;
    }

    const addressIndex = this.addresses.indexOf(str);

    if (addressIndex < 0) {
      if (throwIfNotExisting) {
        throw new Error(`Unknown column alias or address: ${str}`);
      }
      return -1;
    }

    return addressIndex;
  }

  /***
   * Returns the column config for a specific alias, address or hash.
   */
  column(aliasAddressOrHash: ColumnAddress): ColumnInfo {
    const index = this.columnIndex(aliasAddressOrHash);
    return this.columns[index];
  }

  // ...........................................................................
  get count(): number {
    return this.aliases.length;
  }

  // ...........................................................................
  addedColumns(columnsConfig: ColumnsConfig): string[] {
    const a = this.addresses.filter(
      (address) => !columnsConfig.addresses.includes(address),
    );

    return a;
  }

  // ...........................................................................
  static check(aliases: string[], addresses: string[]) {
    // Make shure all keys are lowercase camel case
    // Numbers are not allowed at the beginning
    const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
    const invalidKeys = aliases.filter((key) => !camelCaseRegex.test(key));
    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid alias "${invalidKeys[0]}". ` +
          'Aliases must be lower camel case.',
      );
    }

    // Values must only be letters, numbers and slashes
    const validValueRegex = /^[a-zA-Z0-9/]*$/;
    const invalidValues = addresses.filter(
      (value) => !validValueRegex.test(value),
    );
    if (invalidValues.length > 0) {
      throw new Error(
        `Invalid address "${invalidValues}". ` +
          'Addresses must only contain letters, numbers and slashes.',
      );
    }

    // All path parts must be lower camel case
    const pathParts = addresses.map((value) => value.split('/')).flat();
    const invalidPathParts = pathParts.filter(
      (part) => !camelCaseRegex.test(part),
    );

    if (invalidPathParts.length > 0) {
      throw new Error(
        `Invalid address segment "${invalidPathParts[0]}". ` +
          'Address segments must be lower camel case.',
      );
    }

    // Addresses must not occur more than once
    const addressCountMap: Record<string, number> = {};
    addresses.forEach((value) => {
      addressCountMap[value] = (addressCountMap[value] ?? 0) + 1;
    });

    const duplicateAddresses = Object.entries(addressCountMap)
      .filter(([, count]) => count > 1)
      .map(([address]) => address);

    if (duplicateAddresses.length > 0) {
      throw new Error(
        `Duplicate address ${duplicateAddresses[0]}. A column must only occur once.`,
      );
    }
  }

  // ######################
  // Private
  // ######################

  private _throwOnWrongAlias(columns: ColumnInfo[]): void {
    const aliases = new Set<string>();
    for (const column of columns) {
      if (aliases.has(column.alias)) {
        throw new Error(`Duplicate alias: ${column.alias}`);
      }
      aliases.add(column.alias);
    }
  }

  private _initColumns(columns: ColumnInfo[]): ColumnInfo[] {
    let i = 0;
    return columns.map((column) => {
      return hip({
        ...column,
        addressHash: this.addressHashes[i],
        addressSegments: this.addressSegments[i],
        index: i++,
        _hash: '',
      });
    });
  }
}
