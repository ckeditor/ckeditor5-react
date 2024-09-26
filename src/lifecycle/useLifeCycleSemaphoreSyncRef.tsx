/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useRef, useState, type RefObject } from 'react';
import type { LifeCycleElementSemaphore, LifeCycleAfterMountCallback } from './LifeCycleElementSemaphore.js';

/**
 * When using the `useState` approach, a new instance of the semaphore must be set based on the previous
 * one within the `setState` callback, as shown in this example:
 *
 * 		setState( prevSemaphore => ... )
 *
 * The issue arises from the uncertainty of whether React has batched and cancelled some `setState` calls.
 * This means that setting the state with a semaphore three times might result in the collapsing of these three calls into a single one.
 *
 * Although this may not seem like a significant issue in theory, it can lead to a multitude of minor issues in practice that may
 * generate race conditions. This is because semaphores handle batching independently.
 *
 * A solution involving refs is safer in terms of preserving object references. In other words, `semaphoreRef.current` is guaranteed to
 * always point to the most recent instance of the semaphore.
 */
export const useLifeCycleSemaphoreSyncRef = <R extends object>(): LifeCycleSemaphoreSyncRefResult<R> => {
	const semaphoreRef = useRef<LifeCycleElementSemaphore<R> | null>( null );
	const [ revision, setRevision ] = useState( () => Date.now() );

	const refresh = () => {
		setRevision( Date.now() );
	};

	const release = ( rerender: boolean = true ) => {
		if ( semaphoreRef.current ) {
			semaphoreRef.current.release();
			semaphoreRef.current = null;
		}

		if ( rerender ) {
			setRevision( Date.now() );
		}
	};

	const unsafeSetValue = ( value: R ) => {
		semaphoreRef.current?.unsafeSetValue( value );
		refresh();
	};

	const runAfterMount = ( callback: LifeCycleAfterMountCallback<R> ) => {
		if ( semaphoreRef.current ) {
			semaphoreRef.current.runAfterMount( callback );
		}
	};

	const replace = ( newSemaphore: () => LifeCycleElementSemaphore<R> ) => {
		release( false );
		semaphoreRef.current = newSemaphore();

		refresh();
		runAfterMount( refresh );
	};

	const createAttributeRef = <K extends keyof R>( key: K ): RefObject<R[ K ]> => ( {
		get current() {
			if ( !semaphoreRef.current || !semaphoreRef.current.value ) {
				return null;
			}

			return semaphoreRef.current.value[ key ];
		}
	} );

	return {
		get current() {
			return semaphoreRef.current;
		},
		revision,
		createAttributeRef,
		unsafeSetValue,
		release,
		replace,
		runAfterMount
	};
};

export type LifeCycleSemaphoreSyncRefResult<R> = RefObject<LifeCycleElementSemaphore<R>> & {
	revision: number;
	unsafeSetValue: ( value: R ) => void;
	runAfterMount: ( callback: LifeCycleAfterMountCallback<R> ) => void;
	release: ( rerender?: boolean ) => void;
	replace: ( newSemaphore: () => LifeCycleElementSemaphore<R> ) => void;
	createAttributeRef: <K extends keyof R>( key: K ) => RefObject<R[ K ]>;
};
