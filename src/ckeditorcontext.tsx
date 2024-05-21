/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState, useRef, useEffect, type ReactNode, type ReactElement } from 'react';
import { ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import { useIsMountedRef } from './hooks/useIsMountedRef';

import type { WatchdogConfig } from '@ckeditor/ckeditor5-watchdog/src/watchdog';
import type { Context, ContextConfig } from '@ckeditor/ckeditor5-core';
import type { OptionalRecord } from './types';

export const ContextWatchdogContext = React.createContext<ContextWatchdogValue | null>( null );

const CKEditorContext = <TContext extends Context = Context>( props: Props<TContext> ): ReactElement | null => {
	const {
		id, context, watchdogConfig, isLayoutReady = true,
		config, onReady, onError
	} = props;

	const isMountedRef = useIsMountedRef();
	const pendingContextInitializationsRef = useRef<Array<ContextWatchdog>>( [] );

	const [ currentContextWatchdog, setCurrentContextWatchdog ] = useState<ContextWatchdogValue>( {
		status: 'initializing'
	} );

	/**
	 * Hooks in strict mode runs twice, so we need to make sure that we don't assign the watchdog to state twice.
	 * This is a workaround. We create a initializer queue, and push two watchdogs in initializing state.
	 *
	 * 	1. First push occurs on first render (normal one).
	 * 	2. The second push occurs on the second render (when strict mode rerender occurs).
	 *
	 * Initializer queue is resolved in push order so at the second render we have 2 instances of watchdog.
	 * We need to make sure that we don't assign the watchdog to state twice so we take only the last one.
	 * The first one is destroyed just before assigning it to state.
	 */
	useEffect( () => {
		if ( isLayoutReady ) {
			pendingContextInitializationsRef.current.push( initializeContextWatchdog() );
		} else {
			setCurrentContextWatchdog( {
				status: 'initializing'
			} );
		}
	}, [ id, isLayoutReady ] );

	useEffect( () => () => {
		if ( currentContextWatchdog.status === 'initialized' ) {
			currentContextWatchdog.watchdog.destroy();
		}
	}, [] );

	function initializeContextWatchdog() {
		const contextWatchdog = new ContextWatchdog( context!, watchdogConfig );

		// Returns `true` if the state can be assigned in current promise chain.
		const releaseStateAssignLock = () => {
			pendingContextInitializationsRef.current = pendingContextInitializationsRef.current.filter(
				watchdog => watchdog !== contextWatchdog
			);

			return isMountedRef.current && !pendingContextInitializationsRef.current.length;
		};

		contextWatchdog.on( 'error', ( _, errorEvent ) => {
			props.onError( errorEvent.error, {
				phase: 'runtime',
				willContextRestart: errorEvent.causesRestart
			} );
		} );

		contextWatchdog.on( 'stateChange', () => {
			if ( contextWatchdog!.state === 'ready' && onReady ) {
				onReady( contextWatchdog!.context! );
			}
		} );

		contextWatchdog
			.create( config )
			.then( () => {
				if ( releaseStateAssignLock() ) {
					setCurrentContextWatchdog( {
						status: 'initialized',
						watchdog: contextWatchdog
					} );
				} else {
					contextWatchdog.destroy();
				}
			} )
			.catch( error => {
				onError( error, {
					phase: 'initialization',
					willContextRestart: false
				} );

				if ( releaseStateAssignLock() ) {
					setCurrentContextWatchdog( {
						status: 'error',
						error
					} );
				}
			} );

		return contextWatchdog;
	}

	return (
		<ContextWatchdogContext.Provider value={currentContextWatchdog}>
			{props.children}
		</ContextWatchdogContext.Provider>
	);
};

/**
 * Checks if the given object is of type ContextWatchdogValue.
 * @param obj - The object to be checked.
 * @returns True if the object is of type ContextWatchdogValue, false otherwise.
 */
export const isContextWatchdogValue = ( obj: any ): obj is ContextWatchdogValue =>
	!!obj && typeof obj === 'object' && 'status' in obj && [ 'initializing', 'initialized', 'error' ].includes( obj.status );

/**
 * Checks if the provided object is a context watchdog value with the specified status.
 */
export const isContextWatchdogValueWithStatus = <S extends ContextWatchdogValueStatus>( status: S, obj: any ):
	obj is ExtractContextWatchdogValueByStatus<S> =>
		isContextWatchdogValue( obj ) && obj.status === status;

/**
 * Represents the value of the ContextWatchdog in the CKEditor context.
 */
export type ContextWatchdogValue =
	| {
		status: 'initializing';
	}
	| {
		status: 'initialized';
		watchdog: ContextWatchdog;
	}
	| {
		status: 'error';
		error: ErrorDetails;
	};

export type ContextWatchdogValueStatus = ContextWatchdogValue[ 'status' ];

/**
 * Extracts a specific type of `ContextWatchdogValue` based on its status.
 */
export type ExtractContextWatchdogValueByStatus<S extends ContextWatchdogValueStatus> = Extract<
	ContextWatchdogValue,
	{ status: S }
>;

/**
 * Props for the CKEditorContext component.
 */
type Props<TContext extends Context> =
	& OptionalRecord<{
		id: string;
		isLayoutReady: boolean;
		context: { create( ...args: any ): Promise<any> };
		watchdogConfig: object;
		config: object;
		onReady: Function;
		onError: Function;
	}>
	& {
		context?: { create( ...args: any ): Promise<TContext> };
		watchdogConfig?: WatchdogConfig;
		config?: ContextConfig;
		onReady?: ( context: Context ) => void; // TODO this should accept TContext (after ContextWatchdog release).
		onError: ( error: Error, details: ErrorDetails ) => void;
		children?: ReactNode;
	};

type ErrorDetails = {
	phase: 'initialization' | 'runtime';
	willContextRestart: boolean;
};

export default CKEditorContext;
