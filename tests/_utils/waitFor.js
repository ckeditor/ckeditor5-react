/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export async function waitFor( callback, timeOut = 1000 ) {
	const startTime = Date.now();

	const tick = () => {
		setTimeout( () => {
			try {
				return callback();
			} catch ( err ) {
				if ( Date.now() - startTime > timeOut ) {
					throw err;
				} else {
					tick();
				}
			}
		}, 10 );
	};

	tick();
}
