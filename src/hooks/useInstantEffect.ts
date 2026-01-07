/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { useState, type DependencyList } from 'react';
import { shallowCompareArrays } from '@ckeditor/ckeditor5-integrations-common';

/**
 * Triggers an effect immediately if the dependencies change (during rendering of component).
 *
 * @param fn The effect function to execute.
 * @param deps The dependency list.
 */
export const useInstantEffect = ( fn: VoidFunction, deps: DependencyList ): void => {
	const [ prevDeps, setDeps ] = useState<any>( null );

	if ( !shallowCompareArrays( prevDeps, deps ) ) {
		fn();
		setDeps( [ ...deps ] );
	}
};
