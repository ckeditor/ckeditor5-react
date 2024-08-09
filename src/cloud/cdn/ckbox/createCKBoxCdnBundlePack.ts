/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { CKCdnResourcesPack } from '../loadCKCdnResourcesPack';

import { waitForWindowEntry } from '../../../utils/waitForWindowEntry';
import { createCKBoxCdnUrl, type CKBoxCdnVersion } from './createCKBoxCdnUrl';

/**
 * Type of the exported global variables of the base CKBox bundle.
 */
declare global {
	interface Window {
		CKBox: unknown;
	}
}

/**
 * Creates a pack of resources for the base CKBox bundle.
 *
 * @param config The configuration of the CKBox bundle pack.
 * @returns A pack of resources for the base CKBox bundle.
 * @example
 * ```ts
 * const { CKBox } = await loadCKCdnResourcesPack(
 * 	createCKBoxCdnBundlePack( {
 * 		version: '2.5.1'
 * 	} )
 * );
 * ```
 */
export const createCKBoxBundlePack = ( { version }: CKBoxCdnBundlePackConfig ): CKCdnResourcesPack<Window['CKBox']> => {
	return {
		// Load the main script of the base features.
		scripts: [
			createCKBoxCdnUrl( 'ckbox', 'ckbox.js' )( version )
		],

		// Load the default theme.
		stylesheets: [
			createCKBoxCdnUrl( 'ckbox', 'styles/themes/lark.css' )( version )
		],

		// Pick the exported global variables from the window object.
		getExportedEntries: async () =>
			waitForWindowEntry( [ 'CKBox' ] )
	};
};

/**
 * Configuration of the base CKEditor bundle pack.
 */
export type CKBoxCdnBundlePackConfig = {

	/**
	 * The version of  the base CKEditor bundle.
	 */
	version: CKBoxCdnVersion;
};
