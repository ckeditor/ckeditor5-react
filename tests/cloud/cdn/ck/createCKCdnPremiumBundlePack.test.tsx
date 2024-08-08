/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect } from 'vitest';
import { createCKCdnPremiumBundlePack } from '../../../../src/cloud/cdn/ck/createCKCdnPremiumBundlePack';

describe( 'createCKCdnPremiumBundlePack', () => {
	it( 'should return a pack of resources for the CKEditor Premium Features', () => {
		const pack = createCKCdnPremiumBundlePack( {
			version: '42.0.0',
			languages: [ 'en', 'de' ]
		} );

		expect( pack.preload ).toEqual( [
			'https://cdn.ckeditor.com/ckeditor5-premium-features/42.0.0/ckeditor5-premium-features.css',
			'https://cdn.ckeditor.com/ckeditor5-premium-features/42.0.0/ckeditor5-premium-features.umd.js',
			'https://cdn.ckeditor.com/ckeditor5-premium-features/42.0.0/translations/en.umd.js',
			'https://cdn.ckeditor.com/ckeditor5-premium-features/42.0.0/translations/de.umd.js'
		] );

		expect( pack.scripts ).toHaveLength( 1 );
		expect( pack.stylesheets ).toEqual( [
			'https://cdn.ckeditor.com/ckeditor5-premium-features/42.0.0/ckeditor5-premium-features.css'
		] );

		expect( pack.getExportedEntries ).toBeInstanceOf( Function );
	} );
} );
