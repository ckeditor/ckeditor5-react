/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect, vitest } from 'vitest';
import { loadCKCdnResourcesPack } from '../../../src/cloud/cdn/loadCKCdnResourcesPack';
import { createCKCdnBaseBundlePack } from '../../../src/cloud/cdn/ck/createCKCdnBaseBundlePack';

describe( 'loadCKCdnResourcesPack', () => {
	it( 'should preload and inject resources', async () => {
		const pack = createCKCdnBaseBundlePack( {
			version: '42.0.2'
		} );

		const loaded = await loadCKCdnResourcesPack(
			createCKCdnBaseBundlePack( {
				version: '42.0.2'
			} )
		);

		// Check preloads
		expect( pack.preload ).to.have.length( 2 );

		for ( const preload of pack.preload! ) {
			expect( document.head.querySelector( `link[href="${ preload }"][rel="preload"]` ) ).toBeTruthy();
		}

		// Check styles
		expect( pack.stylesheets ).to.have.length( 1 );

		for ( const stylesheet of pack.stylesheets! ) {
			expect( document.head.querySelector( `link[href="${ stylesheet }"][rel="stylesheet"]` ) ).toBeTruthy();
		}

		// Check JS
		expect( loaded ).to.have.property( 'ClassicEditor' );
		expect( loaded ).to.have.property( 'Paragraph' );
	} );

	it( 'should return the exported global variables', async () => {
		const getExportedEntries = vitest.fn( () => ( {
			ClassicEditor: {
				version: '30.0.0'
			}
		} ) );

		const result = await loadCKCdnResourcesPack( {
			scripts: [],
			getExportedEntries
		} );

		expect( result ).toEqual( {
			ClassicEditor: {
				version: '30.0.0'
			}
		} );

		expect( getExportedEntries ).toHaveBeenCalled();
	} );
} );
