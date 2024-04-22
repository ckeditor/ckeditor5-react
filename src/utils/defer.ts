/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export type Defer<E> = {
	promise: Promise<E>;
	resolve: ( value: E ) => void;
};

export function createDefer<E = void>(): Defer<E> {
	const deferred: Defer<E> = {
		resolve: ( ) => {},
		promise: null as any
	};

	deferred.promise = new Promise<E>( resolve => {
		deferred.resolve = resolve;
	} );

	return deferred;
}
