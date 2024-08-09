/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect } from 'vitest';
import { createCKCdnUrl } from '../../../../src/cloud/cdn/ck/createCKCdnUrl';

describe( 'createCKCdnUrl', () => {
	it( 'should return the correct URL for a given bundle, file, and version', () => {
		const url = createCKCdnUrl( 'classic', 'ckeditor.js' )( '27.0.0' );
		expect( url ).toBe( 'https://cdn.ckeditor.com/classic/27.0.0/ckeditor.js' );
	} );

	it( 'should handle different bundle and file names', () => {
		const url = createCKCdnUrl( 'balloon', 'editor.js' )( '1.2.3' );
		expect( url ).toBe( 'https://cdn.ckeditor.com/balloon/1.2.3/editor.js' );
	} );

	it( 'should handle different versions', () => {
		const url = createCKCdnUrl( 'classic', 'ckeditor.js' )( '1.0.0' );
		expect( url ).toBe( 'https://cdn.ckeditor.com/classic/1.0.0/ckeditor.js' );
	} );
} );
