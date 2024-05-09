/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Shallow comparison of two arrays.
 */
export const shallowCompareArrays = <T>(
	a: Readonly<Array<T>>,
	b: Readonly<Array<T>>
): boolean => {
	if ( a === b ) {
		return true;
	}

	if ( !a || !b ) {
		return false;
	}

	for ( let i = 0; i < a.length; ++i ) {
		if ( a[ i ] !== b[ i ] ) {
			return false;
		}
	}

	return true;
};
