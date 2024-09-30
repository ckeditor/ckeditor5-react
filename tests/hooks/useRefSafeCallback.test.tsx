/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { expect, it, describe, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useRefSafeCallback } from '../../src/hooks/useRefSafeCallback.js';

describe( 'useRefSafeCallback', () => {
	afterEach( cleanup );

	it( 'should return a function', () => {
		const { result } = renderHook( () => useRefSafeCallback( () => {} ) );

		expect( typeof result.current ).toBe( 'function' );
	} );

	it( 'should return the same function reference', () => {
		const { result, rerender } = renderHook( callback => useRefSafeCallback( callback ), {
			initialProps: () => {}
		} );

		const initialCallback = result.current;
		const newFnSpy = vi.fn();

		rerender( newFnSpy );

		expect( result.current ).toBe( initialCallback );
		expect( newFnSpy ).not.toHaveBeenCalled();

		result.current();
		expect( newFnSpy ).toHaveBeenCalledOnce();
	} );

	it( 'should call the callback with the provided arguments', () => {
		const callback = vi.fn();
		const { result } = renderHook( () => useRefSafeCallback( callback ) );

		act( () => {
			result.current( 'arg1', 'arg2' );
		} );

		expect( callback ).toHaveBeenCalledWith( 'arg1', 'arg2' );
	} );

	it( 'should return the result of the callback', () => {
		const { result } = renderHook( () => useRefSafeCallback( () => 'result' ) );

		const callbackResult = result.current();

		expect( callbackResult ).toBe( 'result' );
	} );
} );
