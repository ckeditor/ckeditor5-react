/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState, useRef, useEffect, type ReactNode, type ReactElement, useContext } from 'react';
import {
	ContextWatchdog,
	type Context,
	type ContextConfig,
	type WatchdogConfig
} from 'ckeditor5';
import { useIsMountedRef } from './hooks/useIsMountedRef';
import type { OptionalRecord } from './types';
import { randomID } from './utils/randomId';

export const ContextWatchdogContext = React.createContext<ContextWatchdogValue | null>( null );

/**
 * Custom hook that returns the CKEditor Watchdog context value.
 */
export const useCKEditorWatchdogContext = (): ContextWatchdogValue | null =>
	useContext( ContextWatchdogContext );

/**
 * A React component that provides a context for CKEditor.
 */
const CKEditorContext = <TContext extends Context = Context>( props: Props<TContext> ): ReactElement | null => {
	const {
		id, context, watchdogConfig,
		children, config, onReady,
		isLayoutReady = true,
		onError = ( error, details ) => console.error( error, details )
	} = props;

	const isMountedRef = useIsMountedRef();
	const prevWatchdogInitializationIDRef = useRef<string | null>( null );

	// The currentContextWatchdog state is set to 'initializing' because it is checked later in the CKEditor component
	// which is waiting for the full initialization of the context watchdog.
	const [ currentContextWatchdog, setCurrentContextWatchdog ] = useState<ContextWatchdogValue>( {
		status: 'initializing'
	} );

	useEffect( () => {
		if ( isLayoutReady ) {
			initializeContextWatchdog();
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
	}, [ currentContextWatchdog ] );

	/**
	 * Regenerates the initialization ID by generating a random ID and updating the previous watchdog initialization ID.
	 * This is necessary to ensure that the state update is performed only if the current initialization ID matches the previous one.
	 * This helps to avoid race conditions and ensures that the correct context watchdog is associated with the component.
	 *
	 * @returns The regenerated initialization ID.
	 */
	function regenerateInitializationID() {
		prevWatchdogInitializationIDRef.current = randomID();

		return prevWatchdogInitializationIDRef.current;
	}

	/**
	 * Checks if the state can be updated based on the provided initialization ID.
	 *
	 * @param initializationID - The initialization ID to compare with the previous one.
	 * @returns A boolean indicating whether the state can be updated.
	 */
	function canUpdateState( initializationID: string ) {
		return prevWatchdogInitializationIDRef.current === initializationID && isMountedRef.current;
	}

	/**
	 * Initializes the context watchdog.
	 *
	 * @returns Watchdog instance.
	 */
	function initializeContextWatchdog() {
		// The prevWatchdogInitializationID variable is used to keep track of the previous initialization ID.
		// It is used to ensure that the state update is performed only if the current initialization ID matches the previous one.
		// This helps to avoid race conditions and ensures that the correct context watchdog is associated with the component.
		const watchdogInitializationID = regenerateInitializationID();
		const contextWatchdog = new ContextWatchdog( context!, watchdogConfig );

		// Handle error event from context watchdog
		contextWatchdog.on( 'error', ( _, errorEvent ) => {
			onError( errorEvent.error, {
				phase: 'runtime',
				willContextRestart: errorEvent.causesRestart
			} );
		} );

		// Handle state change event from context watchdog
		contextWatchdog.on( 'stateChange', () => {
			if ( contextWatchdog.state === 'ready' && onReady ) {
				onReady(
					contextWatchdog.context! as TContext,
					contextWatchdog
				);
			}
		} );

		// Create the context watchdog and initialize it with the provided config
		contextWatchdog
			.create( config )
			.then( () => {
				// Check if the state update is still valid and update the current context watchdog
				if ( canUpdateState( watchdogInitializationID ) ) {
					setCurrentContextWatchdog( {
						status: 'initialized',
						watchdog: contextWatchdog
					} );
				} else {
					// Destroy the context watchdog if the state update is no longer valid
					contextWatchdog.destroy();
				}
			} )
			.catch( error => {
				// Handle error during context watchdog initialization
				onError( error, {
					phase: 'initialization',
					willContextRestart: false
				} );

				// Update the current context watchdog with the error status
				if ( canUpdateState( watchdogInitializationID ) ) {
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
			{children}
		</ContextWatchdogContext.Provider>
	);
};

/**
 * Checks if the given object is of type ContextWatchdogValue.
 *
 * @param obj The object to be checked.
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
		onReady?: ( context: TContext, watchdog: ContextWatchdog<TContext> ) => void;
		onError?: ( error: Error, details: ErrorDetails ) => void;
		children?: ReactNode;
	};

type ErrorDetails = {
	phase: 'initialization' | 'runtime';
	willContextRestart: boolean;
};

export default CKEditorContext;
