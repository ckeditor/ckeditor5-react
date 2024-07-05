/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it, vi } from 'vitest';
import { once } from '../../src/utils/once';

describe( 'once', () => {
	it( 'should execute the function only once', () => {
		const mockFn = vi.fn();
		const onceFn = once( mockFn );

		onceFn();
		onceFn();
		onceFn();

		expect( mockFn ).toHaveBeenCalledOnce();
	} );

	it( 'should return the same result on subsequent calls', () => {
		const mockFn = vi.fn().mockReturnValue( 'result' );
		const onceFn = once( mockFn );

		const result1 = onceFn();
		const result2 = onceFn();
		const result3 = onceFn();

		expect( result1 ).toBe( 'result' );
		expect( result2 ).toBe( 'result' );
		expect( result3 ).toBe( 'result' );
	} );
} );
