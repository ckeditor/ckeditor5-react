/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { normalizeClassList } from '../../src/utils/normalizeClassList.js';

describe( 'normalizeClassList', () => {
	it( 'returns the exact same string if a string is provided', () => {
		expect( normalizeClassList( 'my-class' ) ).toBe( 'my-class' );
		expect( normalizeClassList( 'class-one class-two' ) ).toBe( 'class-one class-two' );
	} );

	it( 'joins an array of strings with a space', () => {
		expect( normalizeClassList( [ 'class-one', 'class-two' ] ) ).toBe( 'class-one class-two' );
		expect( normalizeClassList( [ 'single-class' ] ) ).toBe( 'single-class' );
	} );

	it( 'returns an empty string if an empty array is provided', () => {
		expect( normalizeClassList( [] ) ).toBe( '' );
	} );

	it( 'returns an empty string if null is provided', () => {
		expect( normalizeClassList( null ) ).toBe( '' );
	} );

	it( 'returns an empty string if undefined is provided', () => {
		expect( normalizeClassList( undefined ) ).toBe( '' );
	} );
} );
