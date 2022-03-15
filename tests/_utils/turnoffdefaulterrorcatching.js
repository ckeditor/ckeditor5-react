/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

/**
 * Turns off the default error catching
 * so Mocha won't complain about errors caused by the called function.
 */
export default async function turnOffDefaultErrorCatching( fn ) {
	const originalOnError = window.onerror;
	window.onerror = () => {};

	await fn();

	window.onerror = originalOnError;
}
