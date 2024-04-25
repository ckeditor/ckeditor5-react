/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useRef, useState, type RefObject } from 'react';
import type { LifeCycleElementSemaphore } from './LifeCycleElementSemaphore';

/**
 * In `useState` approach setting new instance of semaphore based on previous one must happen inside
 * `setState` callback. Like in this example:
 *
 * 		setState( prevSemaphore => ... )
 *
 *	The problem is that we are not 100% sure if react batched up and canceled some `setState` calls.
 *	It means that setting 3 times state with semaphore might result in canceling collapsing 3 calls into one.
 *	In theory it is not a big deal but in practice it leads to lot small things that may generate
 *	race conditions because semaphores handle batching on their own. Solution with refs is also safer in terms of
 *	object reference preservation. In other words `semaphoreRef.current` is guaranteed to be pointed to always the
 *	newest instance of semaphore.
 */
export const useLifeCycleSemaphoreSyncRef = <R extends object>(): LifeCycleSemaphoreSyncRefResult<R> => {
	const semaphoreRef = useRef<LifeCycleElementSemaphore<R> | null>( null );
	const [ revision, setRevision ] = useState( () => Date.now() );

	const release = ( rerender: boolean = true ) => {
		if ( semaphoreRef.current ) {
			semaphoreRef.current.release();
			semaphoreRef.current = null;
		}

		if ( rerender ) {
			setRevision( Date.now() );
		}
	};

	const replace = ( newSemaphore: () => LifeCycleElementSemaphore<R> ) => {
		release( false );
		semaphoreRef.current = newSemaphore();
		setRevision( Date.now() );
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
		createAttributeRef,
		revision,
		release,
		replace,
		get current() {
			return semaphoreRef.current;
		}
	};
};

type LifeCycleSemaphoreSyncRefResult<R> = RefObject<LifeCycleElementSemaphore<R>> & {
	revision: number;
	release: ( rerender?: boolean ) => void;
	replace: ( newSemaphore: () => LifeCycleElementSemaphore<R> ) => void;
	createAttributeRef: <K extends keyof R>( key: K ) => RefObject<R[ K ]>;
};
