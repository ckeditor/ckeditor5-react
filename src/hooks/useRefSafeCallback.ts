/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useCallback, useRef } from 'react';

/**
 * Hook that guarantees that returns constant reference for passed function.
 * Useful for preventing closures from capturing cached scope variables (avoiding the stale closure problem).
 */
export const useRefSafeCallback = <A extends Array<unknown>, R>( fn: ( ...args: A ) => R ): typeof fn => {
	const callbackRef = useRef<typeof fn>();
	callbackRef.current = fn;

	return useCallback(
		( ...args: A ): R => ( callbackRef.current as typeof fn )( ...args ),
		[]
	);
};
