/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { it, expect, describe } from 'vitest';
import { uid } from '../../src/utils/uid';

describe( 'uid', () => {
	it( 'uid should return a string starting with "e"', () => {
		const id = uid();
		expect( id.startsWith( 'e' ) ).toBe( true );
	} );

	it( 'uid should return a string of length 33', () => {
		const id = uid();
		expect( id.length ).toBe( 33 );
	} );

	it( 'uid should return unique ids', () => {
		const id1 = uid();
		const id2 = uid();
		expect( id1 ).not.toBe( id2 );
	} );

	it( 'uid should only contain hexadecimal characters', () => {
		const id = uid();
		const hexRegex = /^[a-fA-F0-9]+$/;
		expect( hexRegex.test( id.substring( 1 ) ) ).toBe( true );
	} );
} );
