/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { MutableRefObject } from 'react';

import { describe, expect, it, vi } from 'vitest';
import { mergeRefs } from '../../src/utils/mergeRefs.js';

describe( 'mergeRefs', () => {
	it( 'should call the callback ref with the provided value', () => {
		const callbackRef = vi.fn();

		mergeRefs( callbackRef )( 'test' );
		expect( callbackRef ).toHaveBeenCalledWith( 'test' );
	} );

	it( 'should assign the value to the mutable ref object', () => {
		const mutableRefObject: MutableRefObject<string | null> = { current: null };

		mergeRefs( mutableRefObject )( 'test' );
		expect( mutableRefObject.current ).toBe( 'test' );
	} );

	it( 'should assign the value to multiple refs', () => {
		const callbackRef1 = vi.fn();
		const mutableRefObject1 = { current: null };
		const callbackRef2 = vi.fn();
		const mutableRefObject2 = { current: null };

		mergeRefs(
			callbackRef1,
			mutableRefObject1,
			callbackRef2,
			mutableRefObject2
		)( 'test' );

		expect( callbackRef1 ).toHaveBeenCalledWith( 'test' );
		expect( mutableRefObject1.current ).toBe( 'test' );
		expect( callbackRef2 ).toHaveBeenCalledWith( 'test' );
		expect( mutableRefObject2.current ).toBe( 'test' );
	} );

	it( 'should handle null refs', () => {
		const callbackRef = vi.fn();
		const mutableRefObject = { current: null };

		mergeRefs( callbackRef, null, mutableRefObject )( null );
		expect( callbackRef ).toHaveBeenCalledWith( null );
		expect( mutableRefObject.current ).toBe( null );
	} );
} );
