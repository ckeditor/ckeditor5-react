/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsUnmountedRef } from '../../src/hooks/useIsUnmountedRef.js';

describe( 'useIsUnmountedRef', () => {
	it( 'should return a mutable ref object', () => {
		const { result } = renderHook( () => useIsUnmountedRef() );

		expect( result.current ).toHaveProperty( 'current' );
		expect( typeof result.current.current ).toBe( 'boolean' );
	} );

	it( 'should update the ref object when the component is unmounted', () => {
		const { result, unmount } = renderHook( () => useIsUnmountedRef() );

		expect( result.current.current ).toBe( false );

		unmount();

		expect( result.current.current ).toBe( true );
	} );
} );
