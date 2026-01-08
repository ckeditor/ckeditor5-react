/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { useEffect, useRef, type MutableRefObject } from 'react';

/**
 * Custom hook that returns a mutable ref object indicating whether the component is unmounted or not.
 *
 * @returns The mutable ref object.
 */
export const useIsUnmountedRef = (): MutableRefObject<boolean> => {
	const mountedRef = useRef<boolean>( false );

	useEffect( () => {
		// Prevent issues in strict mode.
		mountedRef.current = false;

		return () => {
			mountedRef.current = true;
		};
	}, [] );

	return mountedRef;
};
