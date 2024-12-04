/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export function createDefer() {
	const deferred = {
		resolve: ( ) => {},
		promise: Promise.resolve( null )
	};

	deferred.promise = new Promise( resolve => {
		deferred.resolve = resolve;
	} );

	return deferred;
}
