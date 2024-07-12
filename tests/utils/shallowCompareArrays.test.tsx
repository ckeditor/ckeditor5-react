/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it } from 'vitest';
import { shallowCompareArrays } from '../../src/utils/shallowCompareArrays';

describe( 'shallowCompareArrays', () => {
	it( 'should return true if references are the same', () => {
		const array = [ 1, 2, 3 ];
		expect( shallowCompareArrays( array, array ) ).to.be.true;
	} );

	it( 'should return true for equal arrays', () => {
		const array1 = [ 1, 2, 3 ];
		const array2 = [ 1, 2, 3 ];

		expect( shallowCompareArrays( array1, array2 ) ).to.be.true;
	} );

	it( 'should return false for different arrays', () => {
		const array1 = [ 1, 2, 3 ];
		const array2 = [ 1, 2, 4 ];
		expect( shallowCompareArrays( array1, array2 ) ).to.be.false;
	} );

	it( 'should return false for arrays with different lengths', () => {
		const array1 = [ 1, 2, 3 ];
		const array2 = [ 1, 2 ];
		expect( shallowCompareArrays( array1, array2 ) ).to.be.false;
	} );

	it( 'should return true for empty arrays', () => {
		const array1: Array<number> = [];
		const array2: Array<number> = [];
		expect( shallowCompareArrays( array1, array2 ) ).to.be.true;
	} );
} );
