/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useRef, type DependencyList } from 'react';
import { shallowCompareArrays } from '../utils/shallowCompareArrays';

/**
 * Triggers an effect immediately if the dependencies change (during rendering of component).
 *
 * @param fn The effect function to execute.
 * @param deps The dependency list.
 */
export const useInstantEffect = ( fn: VoidFunction, deps: DependencyList ): void => {
	const prevDeps = useRef<any>( null );

	if ( !shallowCompareArrays( prevDeps.current, deps ) ) {
		prevDeps.current = [ ...deps ];
		fn();
	}
};
