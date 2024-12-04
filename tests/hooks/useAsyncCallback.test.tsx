/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncCallback } from '../../src/hooks/useAsyncCallback.js';
import { timeout } from '../_utils/timeout.js';

describe( 'useAsyncCallback', () => {
	it( 'should execute the callback and update the state correctly when the callback resolves', async () => {
		const fetchData = vi.fn().mockResolvedValue( 'data' );

		const { result } = renderHook( () => useAsyncCallback( fetchData ) );
		const [ onFetchData ] = result.current;

		expect( result.current[ 1 ].status ).toBe( 'idle' );

		act( () => {
			onFetchData();
		} );

		expect( result.current[ 1 ].status ).toBe( 'loading' );

		await waitFor( () => {
			const [ , fetchDataStatus ] = result.current;

			expect( fetchDataStatus.status ).toBe( 'success' );

			if ( fetchDataStatus.status === 'success' ) {
				expect( fetchDataStatus.data ).toBe( 'data' );
			}
		} );
	} );

	it( 'should execute the callback and update the state correctly when the callback rejects', async () => {
		const fetchData = vi.fn().mockRejectedValue( new Error( 'error' ) );

		const { result } = renderHook( () => useAsyncCallback( fetchData ) );
		const [ onFetchData ] = result.current;

		expect( result.current[ 1 ].status ).toBe( 'idle' );

		act( () => {
			onFetchData();
		} );

		expect( result.current[ 1 ].status ).toBe( 'loading' );

		await waitFor( () => {
			const [ , fetchDataStatus ] = result.current;

			expect( fetchDataStatus.status ).toBe( 'error' );

			if ( fetchDataStatus.status === 'error' ) {
				expect( fetchDataStatus.error.message ).toBe( 'error' );
			}
		} );
	} );

	it( 'should not update the state to loading if the component is unmounted', async () => {
		const fetchData = vi.fn().mockResolvedValue( 'data' );

		const { result, unmount } = renderHook( () => useAsyncCallback( fetchData ) );

		const [ onFetchData, fetchDataStatus ] = result.current;

		expect( fetchDataStatus.status ).toBe( 'idle' );
		unmount();

		act( () => {
			onFetchData();
		} );

		expect( fetchDataStatus.status ).toBe( 'idle' );
	} );

	it( 'should not update the state to error if the component is unmounted', async () => {
		const fetchData = vi.fn().mockRejectedValue( new Error( 'error' ) );

		const { result, unmount } = renderHook( () => useAsyncCallback( fetchData ) );
		const [ onFetchData ] = result.current;

		expect( result.current[ 1 ].status ).toBe( 'idle' );

		act( () => {
			onFetchData();
		} );

		expect( result.current[ 1 ].status ).toBe( 'loading' );
		unmount();

		await timeout( 50 );
		await waitFor( () => {
			const [ , fetchDataStatus ] = result.current;

			expect( fetchDataStatus.status ).toBe( 'loading' );
		} );
	} );

	it( 'should not update the state to success if the component is unmounted', async () => {
		const fetchData = vi.fn().mockResolvedValue( 123 );

		const { result, unmount } = renderHook( () => useAsyncCallback( fetchData ) );
		const [ onFetchData ] = result.current;

		expect( result.current[ 1 ].status ).toBe( 'idle' );

		act( () => {
			onFetchData();
		} );

		expect( result.current[ 1 ].status ).toBe( 'loading' );
		unmount();

		await timeout( 50 );
		await waitFor( () => {
			const [ , fetchDataStatus ] = result.current;

			expect( fetchDataStatus.status ).toBe( 'loading' );
		} );
	} );

	it( 'should not update the state if the execution UUID does not match the previous one', async () => {
		let counter = 0;
		const fetchData = vi.fn( async () => {
			if ( !counter ) {
				await timeout( 200 );
			}

			return counter++;
		} );

		const { result } = renderHook( () => useAsyncCallback( fetchData ) );

		const [ onFetchData ] = result.current;

		expect( result.current[ 1 ].status ).toBe( 'idle' );

		act( () => {
			onFetchData();
		} );

		// Do not batch this act() call with the previous one to ensure that the execution UUID is different.
		act( () => {
			onFetchData();
		} );

		await waitFor( () => {
			const [ , fetchDataStatus ] = result.current;

			expect( fetchDataStatus.status ).toBe( 'success' );

			if ( fetchDataStatus.status === 'success' ) {
				expect( fetchDataStatus.data ).toBe( 1 );
			}
		} );
	} );
} );
