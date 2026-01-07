/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncValue } from '../../src/hooks/useAsyncValue.js';

describe( 'useAsyncValue', () => {
	it( 'should return a mutable ref object', async () => {
		const { result } = renderHook( () => useAsyncValue( async () => 123, [] ) );

		expect( result.current.status ).to.equal( 'loading' );

		await waitFor( () => {
			expect( result.current.status ).to.equal( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.data ).to.equal( 123 );
			}
		} );
	} );

	it( 'should reload async value on deps change', async () => {
		let value = 0;
		const { result, rerender } = renderHook( () => useAsyncValue( async () => value, [ value ] ) );

		expect( result.current.status ).to.equal( 'loading' );

		await waitFor( () => {
			expect( result.current.status ).to.equal( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.data ).to.equal( 0 );
			}
		} );

		value = 1;
		rerender();

		expect( result.current.status ).to.equal( 'loading' );

		await waitFor( () => {
			expect( result.current.status ).to.equal( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.data ).to.equal( 1 );
			}
		} );
	} );
} );
