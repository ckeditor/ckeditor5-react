/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it } from 'vitest';
import { createDefer, type Defer } from '../../src/utils/defer';

describe( 'createDefer', () => {
	it( 'should resolve the promise with the provided value', async () => {
		const value = 'test value';
		const defer: Defer<string> = createDefer();

		defer.resolve( value );

		const result = await defer.promise;
		expect( result ).toBe( value );
	} );

	it( 'should create a promise that can be resolved asynchronously', async () => {
		const value = 'test value';
		const defer: Defer<string> = createDefer();

		setTimeout( () => {
			defer.resolve( value );
		}, 100 );

		const result = await defer.promise;
		expect( result ).toBe( value );
	} );
} );
