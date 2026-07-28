/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Listr } from 'listr2';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

vi.mock( '@ckeditor/ckeditor5-dev-release-tools' );
vi.mock( 'listr2', () => ( {
	Listr: vi.fn( function FakeListr() {
		this.run = vi.fn().mockReturnValue( Promise.resolve( undefined ) );
	} )
} ) );

describe( 'scripts/publishpackages', () => {
	let listrTasks;

	beforeEach( async () => {
		vi.resetModules();
		vi.stubEnv( 'CKE5_RELEASE_TOKEN', 'github-token' );

		vi.mocked( releaseTools.getLastFromChangelog ).mockReturnValue( '1.0.0' );
		vi.mocked( releaseTools.getChangesForVersion ).mockReturnValue( 'Changes.' );
		vi.mocked( releaseTools.getNpmTagFromVersion ).mockReturnValue( 'latest' );

		await import( '../scripts/publishpackages.js' );

		listrTasks = vi.mocked( Listr ).mock.calls[ 0 ][ 0 ];
	} );

	describe( 'Publishing packages.', () => {
		it( 'publishes packages using OIDC', async () => {
			vi.mocked( releaseTools.publishPackages ).mockResolvedValue( undefined );

			const { task } = listrTasks.find( ( { title } ) => title === 'Publishing packages.' );

			await task( {}, {} );

			expect( releaseTools.publishPackages ).toHaveBeenCalledTimes( 1 );

			const [ options ] = vi.mocked( releaseTools.publishPackages ).mock.calls[ 0 ];

			expect( options ).toHaveProperty( 'useOidc', true );
			expect( options ).not.toHaveProperty( 'npmOwner' );
		} );
	} );
} );
