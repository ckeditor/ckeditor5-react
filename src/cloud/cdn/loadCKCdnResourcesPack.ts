/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { Awaitable } from '../../types/Awaitable';

import { injectScript } from '../../utils/injectScript';
import { injectStylesheet } from '../../utils/injectStylesheet';
import { preloadResource } from '../../utils/preloadResource';

/**
 * A pack of resources to load (scripts and stylesheets) and the exported global variables.
 */
export type CKCdnResourcesPack<R = any> = {

	/**
	 * List of resources to preload, it should improve the performance of loading the resources.
	 */
	preload?: Array<string>;

	/**
	 * List of scripts to load. Scripts are loaded in the order they are defined.
	 */
	scripts?: Array<string | ( () => Awaitable<unknown> )>;

	/**
	 * List of stylesheets to load. Stylesheets are loaded in the order they are defined.
	 */
	stylesheets?: Array<string>;

	/**
	 * Get JS object with global variables exported by scripts.
	 */
	getExportedEntries?: () => Awaitable<R>;
};

/**
 * Extracts the type of the exported global variables from a CKResourcesPack.
 */
export type InferCKCdnResourcesPackExportsType<P> = P extends CKCdnResourcesPack<infer R> ? R : never;

/**
 * Loads pack of resources (scripts and stylesheets) and returns the exported global variables (if any).
 *
 * @param pack The pack of resources to load.
 * @returns A promise that resolves with the exported global variables.
 * @example
 *
 * ```ts
 * const ckeditor = await loadCKCdnResourcesPack<ClassicEditor>( {
 * 	scripts: [
 * 		'https://cdn.ckeditor.com/ckeditor5/30.0.0/classic/ckeditor.js'
 * 	],
 * 	getExportedEntries: () => ( window as any ).ClassicEditor
 * } );
 * ```
 */
export const loadCKCdnResourcesPack = async <P extends CKCdnResourcesPack<any>>(
	{
		scripts = [],
		stylesheets = [],
		preload,
		getExportedEntries
	}: P
): Promise<InferCKCdnResourcesPackExportsType<P>> => {
	// If preload is not defined, use all stylesheets and scripts as preload resources.
	if ( !preload ) {
		preload = [
			...stylesheets.filter( item => typeof item === 'string' ),
			...scripts.filter( item => typeof item === 'string' )
		];
	}

	// Preload resources specified in the pack.
	preload.forEach( preloadResource );

	// Load stylesheet tags before scripts to avoid flash of unstyled content.
	await Promise.all(
		stylesheets.map( injectStylesheet )
	);

	// Load script tags.
	for ( const script of scripts ) {
		if ( typeof script === 'string' ) {
			await injectScript( script );
		} else {
			await script();
		}
	}

	// Wait for execution all injected scripts.
	return getExportedEntries?.();
};
