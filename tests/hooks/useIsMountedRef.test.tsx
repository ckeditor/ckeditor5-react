/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMountedRef } from '../../src/hooks/useIsMountedRef';

describe( 'useIsMountedRef', () => {
	it( 'should return a mutable ref object', () => {
		const { result } = renderHook( () => useIsMountedRef() );

		expect( result.current.current ).to.be.true;
	} );

	it( 'should update the ref object when the component is unmounted', () => {
		const { result, unmount } = renderHook( () => useIsMountedRef() );

		expect( result.current.current ).to.be.true;

		unmount();

		expect( result.current.current ).to.be.false;
	} );
} );
