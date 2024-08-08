/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect } from 'vitest';
import { combineCKCdnBundlesPacks } from '../../../src/cloud/cdn/combineCKCdnBundlesPacks';

describe( 'combineCKCdnBundlesPacks', () => {
	it( 'should combine multiple CKEditor CDN bundles packs into a single pack', async () => {
		const pack1 = {
			preload: [ 'preload1' ],
			scripts: [ 'script1' ],
			stylesheets: [ 'stylesheet1' ],
			getExportedEntries: async () => ( { exported1: 'value1' } )
		};

		const pack2 = {
			preload: [ 'preload2' ],
			scripts: [ 'script2' ],
			stylesheets: [ 'stylesheet2' ],
			getExportedEntries: async () => ( { exported2: 'value2' } )
		};

		const combinedPack = combineCKCdnBundlesPacks( {
			Pack1: pack1,
			Pack2: pack2
		} );

		expect( combinedPack.preload ).toEqual( [ 'preload1', 'preload2' ] );
		expect( combinedPack.scripts ).toEqual( [ 'script1', 'script2' ] );
		expect( combinedPack.stylesheets ).toEqual( [
			'stylesheet1',
			'stylesheet2'
		] );

		const exportedEntries = await combinedPack.getExportedEntries!();

		expect( exportedEntries ).toEqual( {
			Pack1: { exported1: 'value1' },
			Pack2: { exported2: 'value2' }
		} );
	} );

	it( 'should handle undefined packs', async () => {
		const pack1 = {
			preload: [ 'preload1' ],
			scripts: [ 'script1' ],
			stylesheets: [ 'stylesheet1' ],
			getExportedEntries: async () => ( { exported1: 'value1' } )
		};

		const combinedPack = combineCKCdnBundlesPacks( {
			Pack1: pack1,
			Pack2: undefined
		} );

		expect( combinedPack.preload ).toEqual( [ 'preload1' ] );
		expect( combinedPack.scripts ).toEqual( [ 'script1' ] );
		expect( combinedPack.stylesheets ).toEqual( [ 'stylesheet1' ] );

		const exportedEntries = await combinedPack.getExportedEntries!();

		expect( exportedEntries ).toEqual( {
			Pack1: { exported1: 'value1' },
			Pack2: undefined
		} );
	} );

	it( 'should handle empty packs', async () => {
		const combinedPack = combineCKCdnBundlesPacks( {} );

		expect( combinedPack.preload ).toEqual( [] );
		expect( combinedPack.scripts ).toEqual( [] );
		expect( combinedPack.stylesheets ).toEqual( [] );

		const exportedEntries = await combinedPack.getExportedEntries!();

		expect( exportedEntries ).toEqual( {} );
	} );
} );
