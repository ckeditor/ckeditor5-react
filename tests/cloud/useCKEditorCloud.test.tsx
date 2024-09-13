/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import type { CKEditorCloudConfig } from '@ckeditor/ckeditor5-integrations-common';
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

import useCKEditorCloud from '../../src/cloud/useCKEditorCloud.js';

describe( 'useCKEditorCloud', () => {
	beforeEach( removeAllCkCdnResources );

	it( 'should load CKEditor bundles from CDN', async () => {
		const { result } = renderHook( () => useCKEditorCloud( {
			version: '43.0.0',
			translations: [ 'es', 'de' ]
		} ) );

		expect( result.current.status ).toBe( 'loading' );

		await waitFor( () => {
			expect( result.current.status ).toBe( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.CKEditor ).toBeDefined();
			}
		} );
	} );

	it( 'should load additional bundle after updating deps', async () => {
		const { result, rerender } = renderHook(
			( config: CKEditorCloudConfig<any> ) => useCKEditorCloud( config ),
			{
				initialProps: {
					version: '43.0.0',
					premium: false
				}
			}
		);

		await waitFor( () => {
			expect( result.current.status ).toBe( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.CKEditor ).toBeDefined();
				expect( result.current.CKEditorPremiumFeatures ).toBeUndefined();
			}
		} );

		rerender( {
			version: '43.0.0',
			premium: true
		} );

		act( () => {
			expect( result.current.status ).toBe( 'loading' );
		} );

		await waitFor( () => {
			expect( result.current.status ).toBe( 'success' );

			if ( result.current.status === 'success' ) {
				expect( result.current.CKEditor ).toBeDefined();
				expect( result.current.CKEditorPremiumFeatures ).toBeDefined();
			}
		} );
	} );

	describe( 'typings', () => {
		it( 'should return non-nullable premium features entry type if premium is enabled', async () => {
			const { result } = renderHook( () => useCKEditorCloud( {
				version: '43.0.0',
				premium: true
			} ) );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );

			if ( result.current.status === 'success' ) {
				expectTypeOf( result.current.CKEditorPremiumFeatures ).not.toBeNullable();
			}
		} );

		it( 'should return nullable premium features entry type if premium is disabled', async () => {
			const { result } = renderHook( () => useCKEditorCloud( {
				version: '43.0.0',
				premium: false
			} ) );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );

			if ( result.current.status === 'success' ) {
				expectTypeOf( result.current.CKEditorPremiumFeatures ).toBeNullable();
			}
		} );

		it( 'should return nullable premium features entry type if premium is not provided', async () => {
			const { result } = renderHook( () => useCKEditorCloud( {
				version: '43.0.0'
			} ) );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );

			if ( result.current.status === 'success' ) {
				expectTypeOf( result.current.CKEditorPremiumFeatures ).toBeNullable();
			}
		} );

		it( 'should return non-nullable ckbox entry type if ckbox enabled', async () => {
			const { result } = renderHook( () => useCKEditorCloud( {
				version: '43.0.0',
				ckbox: {
					version: '2.5.1'
				}
			} ) );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );

			if ( result.current.status === 'success' ) {
				expectTypeOf( result.current.CKBox ).not.toBeNullable();
			}
		} );

		it( 'should return a nullable ckbox entry type if ckbox is not configured', async () => {
			const { result } = renderHook( () => useCKEditorCloud( {
				version: '43.0.0'
			} ) );

			await waitFor( () => {
				expect( result.current.status ).toBe( 'success' );
			} );

			if ( result.current.status === 'success' ) {
				expectTypeOf( result.current.CKBox ).toBeNullable();
			}
		} );
	} );
} );
