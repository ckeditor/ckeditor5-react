/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect } from 'vitest';
import {
	createCKCdnBaseBundlePack,
	type CKCdnBaseBundlePackConfig
} from '../../../../src/cloud/cdn/ck/createCKCdnBaseBundlePack';

describe( 'createCKCdnBaseBundlePack', () => {
	it( 'should create a pack of resources for the base CKEditor bundle', () => {
		const config: CKCdnBaseBundlePackConfig = {
			version: '42.0.0',
			languages: [ 'en', 'de' ]
		};

		const pack = createCKCdnBaseBundlePack( config );

		expect( pack.preload ).toEqual( [
			'https://cdn.ckeditor.com/ckeditor5/42.0.0/ckeditor5.css',
			'https://cdn.ckeditor.com/ckeditor5/42.0.0/ckeditor5.umd.js',
			'https://cdn.ckeditor.com/ckeditor5/42.0.0/translations/en.umd.js',
			'https://cdn.ckeditor.com/ckeditor5/42.0.0/translations/de.umd.js'
		] );

		expect( pack.scripts ).toHaveLength( 1 );
		expect( pack.scripts![ 0 ] ).toBeInstanceOf( Function );

		expect( pack.stylesheets ).toEqual( [
			'https://cdn.ckeditor.com/ckeditor5/42.0.0/ckeditor5.css'
		] );

		expect( pack.getExportedEntries ).toBeInstanceOf( Function );
	} );
} );
