// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

/**
 * Describes an action that is applied to a column.
 */
export interface EditAction extends Json {
  /**
   * The path of the column the action is applied to.
   */
  column: string;

  /*
   * The value that is written into the column
   */
  setValue: any;

  /*
   * The hash of the action
   */
  _hash?: string;
}

// .............................................................................
export const exampleEditAction = (): EditAction => {
  return hip({
    column: 'basicTypes/stringsRef/value',
    setValue: 500,
  });
};
