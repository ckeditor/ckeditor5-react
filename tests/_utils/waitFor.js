/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export async function waitFor( callback, { timeOut = 1000, retry = 50 } = {} ) {
	return new Promise( ( resolve, reject ) => {
		const startTime = Date.now();

		const tick = () => {
			setTimeout( async () => {
				try {
					await callback();
					resolve();
				} catch ( err ) {
					if ( Date.now() - startTime > timeOut ) {
						reject( err );
					} else {
						tick();
					}
				}
			}, retry );
		};

		tick();
	} );
}
