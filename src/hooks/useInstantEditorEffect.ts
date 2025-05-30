/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { DependencyList } from 'react';
import type { LifeCycleElementSemaphore } from '../lifecycle/LifeCycleElementSemaphore.js';

import { useInstantEffect } from './useInstantEffect.js';

/**
 * `useEffect` alternative but executed after mounting of editor.
 */
export const useInstantEditorEffect = <R>(
	semaphore: Pick<LifeCycleElementSemaphore<R>, 'runAfterMount'> | null,
	fn: ( mountResult: R ) => void,
	deps: DependencyList
): void => {
	useInstantEffect( () => {
		if ( semaphore ) {
			semaphore.runAfterMount( fn );
		}
	}, [ semaphore, ...deps ] );
};
