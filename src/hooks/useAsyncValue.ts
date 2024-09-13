/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { DependencyList } from 'react';

import { useInstantEffect } from './useInstantEffect.js';
import { useAsyncCallback, type AsyncCallbackState } from './useAsyncCallback.js';

/**
 * A hook that allows to execute an asynchronous function and provides the state of the execution.
 * The asynchronous function is executed immediately after the component is mounted.
 *
 * @param callback The asynchronous function to be executed.
 * @param deps The dependency list.
 * @returns The state of the execution.
 *
 * @example
 * ```tsx
 * const asyncFetchState = useAsyncValue( async () => {
 * 	const response = await fetch( 'https://api.example.com/data' );
 * 	const data = await response.json();
 * 	return data;
 * }, [] );
 *
 * if ( asyncFetchState.status === 'loading' ) {
 * 	return <p>Loading...</p>;
 * }
 *
 * if ( asyncFetchState.status === 'success' ) {
 * 	return <pre>{ JSON.stringify( asyncFetchState.data, null, 2 ) }</pre>;
 * }
 *
 * if ( asyncFetchState.status === 'error' ) {
 * 	return <p>Error: { asyncFetchState.error.message }</p>;
 * }
 * ```
 */
export const useAsyncValue = <A extends Array<unknown>, R>(
	callback: ( ...args: Array<A> ) => Promise<R>,
	deps: DependencyList
): AsyncValueHookResult<R> => {
	const [ asyncCallback, asyncState ] = useAsyncCallback( callback );

	useInstantEffect( asyncCallback, deps );

	// There might be short delay between the effect and the state update.
	// So it is possible that the status is still 'idle' after the effect.
	// In such case, we should return 'loading' status because the effect is already queued to be executed.
	if ( asyncState.status === 'idle' ) {
		return {
			status: 'loading'
		};
	}

	return asyncState;
};

/**
 * The result of the `useAsyncValue` hook.
 */
export type AsyncValueHookResult<R> = Exclude<AsyncCallbackState<R>, { status: 'idle' }>;
