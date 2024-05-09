/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * A utility function that removes duplicate elements from an array.
 */
export function uniq<A>( source: Array<A> ): Array<A> {
	return Array.from( new Set( source ) );
}
