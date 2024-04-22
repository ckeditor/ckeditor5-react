/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export function timeout( ms ) {
	return new Promise( resolve => {
		setTimeout( resolve, ms );
	} );
}
