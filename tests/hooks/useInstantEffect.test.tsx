/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { useInstantEffect } from '../../src/hooks/useInstantEffect.js';

describe( 'useInstantEffect', () => {
	afterEach( cleanup );

	it( 'should call the effect function when dependencies change', () => {
		const effectFn = vi.fn();
		const { rerender } = renderHook( deps => useInstantEffect( effectFn, deps ), {
			initialProps: [ 1, 2, 3 ]
		} );

		expect( effectFn ).toHaveBeenCalledTimes( 1 );

		rerender( [ 4, 5, 6 ] );
		expect( effectFn ).toHaveBeenCalledTimes( 2 );

		rerender( [ 4, 5, 6 ] );
		expect( effectFn ).toHaveBeenCalledTimes( 2 );

		rerender( [ 7, 8, 9 ] );
		expect( effectFn ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'should not call the effect function when dependencies do not change', () => {
		const effectFn = vi.fn();
		const { rerender } = renderHook( deps => useInstantEffect( effectFn, deps ), {
			initialProps: [ 1, 2, 3 ]
		} );

		expect( effectFn ).toHaveBeenCalledTimes( 1 );

		rerender( [ 1, 2, 3 ] );
		expect( effectFn ).toHaveBeenCalledTimes( 1 );

		rerender( [ 1, 2, 3 ] );
		expect( effectFn ).toHaveBeenCalledTimes( 1 );
	} );
} );
