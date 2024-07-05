/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it } from 'vitest';
import { overwriteObject } from '../../src/utils/overwriteObject';

describe( 'overwriteObject', () => {
	it( 'overwriteObject should clear the destination object and copy properties from the source object', () => {
		const source = { a: 1, b: 2, c: 10 };
		const destination = { a: 10, b: 3, c: 20 };

		const result = overwriteObject( source, destination );

		expect( result ).toBe( destination );
		expect( result ).toEqual( { a: 1, b: 2, c: 10 } );
	} );

	it( 'should not override prototype properties', () => {
		const source = { a: 1, b: 2, c: 10 };
		const destination = Object.create( { a: 10, b: 3, c: 20 } );

		const result = overwriteObject( source, destination );

		expect( result ).toBe( destination );
		expect( result ).toEqual( { a: 1, b: 2, c: 10 } );
	} );

	it( 'should remove properties from destination that are not present in source', () => {
		const source = { a: 1, b: 2 };
		const destination = { a: 10, b: 3, c: 20 };

		const result = overwriteObject( source, destination );

		expect( result ).toBe( destination );
		expect( result ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'should not set self referencing attributes which crashes Object.assign', () => {
		const source = { a: 1, b: 2, c: 10, d: null as any };
		const destination = { a: 10, b: 3, c: 20 };

		source.d = destination;

		const result = overwriteObject( source, destination );

		expect( result ).toBe( destination );
		expect( result ).toEqual( { a: 1, b: 2, c: 10 } );
	} );
} );
