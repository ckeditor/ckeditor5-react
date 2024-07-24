/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
