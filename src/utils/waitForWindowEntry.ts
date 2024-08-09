/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { waitFor, type WaitForConfig } from './waitFor';

/**
 * Waits for the provided window entry to be available. It's used mostly for waiting for the CKEditor 5 window object to be available.
 * In theory these entries should be available immediately, but in practice, they might be loaded asynchronously because browser might
 * delay execution of the script even if it's loaded synchronously.
 *
 * Function ensures that proper type declarations are present on global Window interface.
 *
 * @param entryNames The names of the window entries to wait for.
 * @param config Configuration for the function.
 * @returns A promise that resolves when the window entry is available.
 *
 * @example
 * ```ts
 * const ckeditor = await waitForWindowEntry<CKEditor>( [ 'CKEditor' ] );
 * ```
 */
export const waitForWindowEntry = async <
	N extends keyof Window,
	O = Window[ N ]
>( entryNames: Array<N>, config?: WaitForConfig ): Promise<O> => {
	// Try to pick the bundle from the window object.
	const tryPickBundle = () => (
		entryNames
			.map( name => ( window as any )[ name ] )
			.filter( Boolean )[ 0 ]
	);

	return waitFor<O>(
		() => tryPickBundle() ?? new Error( `Window entry "${ entryNames.join( ',' ) }" not found.` ),
		config
	);
};
