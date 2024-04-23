/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export type Defer<E> = {
	promise: Promise<E>;
	resolve: ( value: E ) => void;
};

/**
 * This function generates a promise that can be resolved by invoking the returned `resolve` method.
 * It proves to be beneficial in the creation of various types of locks and semaphores.
 */
export function createDefer<E = void>(): Defer<E> {
	const deferred: Defer<E> = {
		resolve: null as any,
		promise: null as any
	};

	deferred.promise = new Promise<E>( resolve => {
		deferred.resolve = resolve;
	} );

	return deferred;
}
