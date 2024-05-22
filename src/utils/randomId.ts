/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Generates a random ID.
 */
export function randomID(): string {
	return `${ Math.random().toString( 36 ).slice( 2 ) }-${ Date.now() }`;
}
