/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type * as CKEditor from 'ckeditor5';
import type { CKCdnResourcesPack } from './loadCKCdnResourcesPack';

import { createCKCdnUrl, type CKCdnVersion } from './createCKCdnUrl';
import { waitForWindowEntry } from '../../utils/waitForWindowEntry';
import { injectScriptsInParallel } from '../../utils/injectScript';

/**
 * Type of the exported global variables of the base CKEditor bundle.
 */
declare global {
	interface Window {
		CKEDITOR: typeof CKEditor;
		ckeditor5: Window['CKEDITOR'];
	}
}

/**
 * Creates a pack of resources for the base CKEditor bundle.
 *
 * @param config The configuration of the CKEditor Premium Features pack.
 * @returns A pack of resources for  the base CKEditor bundle.
 * @example
 *
 * ```ts
 * const { Paragraph } = await loadCKCdnResourcesPack(
 * 	createCKCdnBaseBundlePack( {
 * 		version: '42.0.0',
 * 		languages: [ 'en', 'de' ]
 * 	} )
 * );
 * ```
 */
export const createCKCdnBaseBundlePack = (
	{
		version,
		languages
	}: CKCdnBaseBundlePackConfig
): CKCdnResourcesPack<Window['CKEDITOR']> => {
	const urls = {
		scripts: [
			// Load the main script of the base features.
			createCKCdnUrl( 'ckeditor5', 'ckeditor5.umd.js' )( version ),

			// Load all JavaScript files from the base features.
			...( languages || [] ).map( language =>
				createCKCdnUrl( 'ckeditor5', `translations/${ language }.umd.js` )( version )
			)
		],

		stylesheets: [
			createCKCdnUrl( 'ckeditor5', 'ckeditor5.css' )( version )
		]
	};

	return {
		// Preload resources specified in the pack, before loading the main script.
		preload: [
			...urls.stylesheets,
			...urls.scripts
		],

		scripts: [
			// It's safe to load translations and the main script in parallel.
			async () => injectScriptsInParallel( urls.scripts )
		],

		// Load all stylesheets of the base features.
		stylesheets: urls.stylesheets,

		// Pick the exported global variables from the window object.
		getExportedEntries: async () =>
			waitForWindowEntry( [ 'ckeditor5', 'CKEDITOR' ] )
	};
};

/**
 * Configuration of the base CKEditor bundle pack.
 */
export type CKCdnBaseBundlePackConfig = {

	/**
	 * The version of  the base CKEditor bundle.
	 */
	version: CKCdnVersion;

	/**
	 * The list of languages to load.
	 */
	languages?: Array<string>;
};
