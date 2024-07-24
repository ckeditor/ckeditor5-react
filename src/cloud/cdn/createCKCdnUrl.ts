/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * The URL of the CKEditor CDN.
 */
export const CK_CDN_URL = 'https://cdn.ckeditor.com';

/**
 * A version of a file on the CKEditor CDN.
 */
export type CKCdnVersion = `${ number }.${ number }.${ number }`;

/**
 * Creates a URL to a file on the CKEditor CDN.
 *
 * @param bundle The name of the bundle.
 * @param file The name of the file.
 * @returns A function that accepts the version of the file and returns the URL.
 *
 * ```ts
 * const url = createCKCdnUrl( 'classic', 'ckeditor.js' )( '27.0.0' );
 *
 * expect( url ).to.be.equal( 'https://cdn.ckeditor.com/classic/27.0.0/ckeditor.js' );
 * ```
 */
export const createCKCdnUrl = ( bundle: string, file: string ) => ( version: CKCdnVersion ): string =>
	`${ CK_CDN_URL }/${ bundle }/${ version }/${ file }`;
