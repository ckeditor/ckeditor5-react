/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, {
	useRef, useContext, useState, useEffect,
	type PropsWithChildren,
	type ReactElement
} from 'react';

import { uid } from '@ckeditor/ckeditor5-integrations-common';
import { useIsMountedRef } from '../hooks/useIsMountedRef.js';
import {
	useInitializedCKEditorsMap,
	type InitializedContextEditorsConfig
} from './useInitializedCKEditorsMap.js';

import {
	onEditorError,
	type Context,
	type ContextConfig
} from 'ckeditor5';

export const CKEditorContextValueContext = React.createContext<CKEditorContextValue | null>( null );

/**
 * Custom hook that returns the CKEditor context value.
 */
export const useCKEditorContextValue = (): CKEditorContextValue | null =>
	useContext( CKEditorContextValueContext );

/**
 * A React component that provides a context for CKEditor.
 */
const CKEditorContext = <TContext extends Context = Context>( props: Props<TContext> ): ReactElement | null => {
	const {
		id, context: ContextConstructor,
		children, config, onReady,
		isLayoutReady = true,
		onChangeInitializedEditors,
		onError = ( error, details ) => console.error( error, details )
	} = props;

	const isMountedRef = useIsMountedRef();
	const prevInitializationIDRef = useRef<string | null>( null );

	// The state starts as 'initializing' because the CKEditor component checks it and waits for the context
	// to be fully initialized before creating an editor in it.
	const [ currentContext, setCurrentContext ] = useState<CKEditorContextValue<TContext>>( {
		status: 'initializing'
	} );

	// Lets initialize the context when the layout is ready.
	useEffect( () => {
		if ( isLayoutReady ) {
			initializeContext();
		} else {
			setCurrentContext( {
				status: 'initializing'
			} );
		}
	}, [ id, isLayoutReady ] );

	// Cleanup the context when the component is unmounted. Abort if it is not initialized.
	useEffect( () => () => {
		if ( currentContext.status === 'initialized' ) {
			currentContext.context.destroy();
		}
	}, [ currentContext ] );

	// Report the errors that escape the context while it is running. This is one of the two halves of
	// `onError`; the other one is the rejected `create()` promise below. Reporting only covers a running
	// context, so both are needed.
	useEffect( () => {
		if ( currentContext.status !== 'initialized' ) {
			return;
		}

		const { context } = currentContext;

		return onEditorError( ( { error, source } ) => {
			if ( source !== context ) {
				return;
			}

			onError( error, { phase: 'runtime' } );
		} );
	}, [ currentContext ] );

	// Listen for the editor initialization and destruction events and call the onChangeInitializedEditors function.
	useInitializedCKEditorsMap( {
		currentContext,
		onChangeInitializedEditors
	} );

	/**
	 * Regenerates the initialization ID by generating a random ID and updating the previous initialization ID.
	 * This is necessary to ensure that the state update is performed only if the current initialization ID matches
	 * the previous one. This helps to avoid race conditions and ensures that the correct context is associated with
	 * the component.
	 *
	 * @returns The regenerated initialization ID.
	 */
	function regenerateInitializationID() {
		prevInitializationIDRef.current = uid();

		return prevInitializationIDRef.current;
	}

	/**
	 * Checks if the state can be updated based on the provided initialization ID.
	 *
	 * @param initializationID The initialization ID to compare with the previous one.
	 * @returns A boolean indicating whether the state can be updated.
	 */
	function canUpdateState( initializationID: string ) {
		return prevInitializationIDRef.current === initializationID && isMountedRef.current;
	}

	/**
	 * Initializes the context.
	 */
	function initializeContext() {
		// The ID keeps track of the previous initialization, so that a state update is performed only when it
		// matches. This avoids race conditions and makes sure the right context ends up on the component.
		const initializationID = regenerateInitializationID()!;

		ContextConstructor
			.create( config )
			.then( context => {
				if ( canUpdateState( initializationID ) ) {
					if ( onReady ) {
						onReady( context );
					}

					setCurrentContext( {
						status: 'initialized',
						context
					} );
				} else {
					// Destroy the context if the state update is no longer valid.
					context.destroy();
				}
			} )
			.catch( error => {
				if ( canUpdateState( initializationID ) ) {
					onError( error, { phase: 'initialization' } );

					setCurrentContext( {
						status: 'error',
						error
					} );
				}
			} );
	}

	return (
		<CKEditorContextValueContext.Provider value={currentContext}>
			{children}
		</CKEditorContextValueContext.Provider>
	);
};

/**
 * Checks if the given object is of type CKEditorContextValue.
 *
 * @param obj The object to be checked.
 * @returns True if the object is of type CKEditorContextValue, false otherwise.
 */
export const isCKEditorContextValue = ( obj: any ): obj is CKEditorContextValue =>
	!!obj && typeof obj === 'object' && 'status' in obj && [ 'initializing', 'initialized', 'error' ].includes( obj.status );

/**
 * Checks if the provided object is a context value with the specified status.
 */
export const isCKEditorContextValueWithStatus = <S extends CKEditorContextValueStatus>( status: S ) =>
	( obj: any ): obj is ExtractCKEditorContextValueByStatus<S> =>
		isCKEditorContextValue( obj ) && obj.status === status;

/**
 * Checks if the context is currently initializing.
 */
export const isCKEditorContextInitializing = isCKEditorContextValueWithStatus( 'initializing' );

/**
 * Checks if the provided object is a fully initialized context value.
 */
export const isCKEditorContextReadyToUse = ( obj: any ): obj is ExtractCKEditorContextValueByStatus<'initialized'> =>
	isCKEditorContextValueWithStatus( 'initialized' )( obj );

/**
 * Represents the value of the context in the CKEditor React context.
 */
export type CKEditorContextValue<TContext extends Context = Context> =
	| {
		status: 'initializing';
	}
	| {
		status: 'initialized';
		context: TContext;
	}
	| {
		status: 'error';
		error: ContextErrorDetails;
	};

/**
 * Represents the status of the CKEditorContextValue.
 */
export type CKEditorContextValueStatus = CKEditorContextValue[ 'status' ];

/**
 * Extracts a specific type of `CKEditorContextValue` based on its status.
 */
export type ExtractCKEditorContextValueByStatus<S extends CKEditorContextValueStatus> = Extract<
	CKEditorContextValue,
	{ status: S }
>;

/**
 * Props for the CKEditorContext component.
 */
export type Props<TContext extends Context> =
	& PropsWithChildren
	& Pick<InitializedContextEditorsConfig<TContext>, 'onChangeInitializedEditors'>
	& {
		id?: string;
		isLayoutReady?: boolean;
		context: { create( ...args: any ): Promise<TContext> };
		config?: ContextConfig;
		onReady?: ( context: TContext ) => void;
		onError?: ( error: Error, details: ContextErrorDetails ) => void;
	};

/**
 * Tells whether the error escaped a running context or stopped it from being created in the first place.
 */
export type ContextErrorDetails = {
	phase: 'initialization' | 'runtime';
};

export default CKEditorContext;
