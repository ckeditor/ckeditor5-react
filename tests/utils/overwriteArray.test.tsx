/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it } from 'vitest';
import { overwriteArray } from '../../src/utils/overwriteArray';

describe( 'overwriteArray', () => {
	it( 'should clear the destination array and copy the elements from the source array', () => {
		const source = [ 1, 2, 3 ];
		const destination = [ 4, 5, 6 ];

		const result = overwriteArray( source, destination );

		expect( result ).toBe( destination );
		expect( result ).toEqual( source );
	} );
} );
