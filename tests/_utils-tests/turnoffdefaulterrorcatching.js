/* global window */

/**
 * Turns off the default error catching
 * so Mocha won't complain about errors caused by the called function.
 */
export default async function turnOffDefaultErrorCatching( fn ) {
	const originalOnError = window.onerror;
	window.onerror = null;

	await fn();

	window.onerror = originalOnError;
}
