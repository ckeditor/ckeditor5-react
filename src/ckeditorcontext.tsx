/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState, useRef, type ReactNode, type ReactElement, useEffect } from 'react';
import { ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';

import type { WatchdogConfig } from '@ckeditor/ckeditor5-watchdog/src/watchdog';
import type { Context, ContextConfig } from '@ckeditor/ckeditor5-core';
import type { OptionalRecord } from './types';

export const ContextWatchdogContext = React.createContext<ContextWatchdog | null>( null );

const CKEditorContext = <TContext extends Context = Context>( props: Props<TContext> ): ReactElement | null => {
	const {
		id, context, watchdogConfig, isLayoutReady = true,
		config, onReady, onError
	} = props;

	const pendingContextInitializationsRef = useRef<Array<ContextWatchdog>>( [] );
	const [ currentContextWatchdog, setCurrentContextWatchdog ] = useState<ContextWatchdog<TContext> | null>( null );

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
			setCurrentContextWatchdog( null );
		}
	}, [ id, isLayoutReady ] );

	useEffect( () => () => {
		if ( currentContextWatchdog ) {
			currentContextWatchdog.destroy();
		}
	}, [ ] );

	function initializeContextWatchdog() {
		const contextWatchdog = new ContextWatchdog( context!, watchdogConfig );

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
				pendingContextInitializationsRef.current = pendingContextInitializationsRef.current.filter(
					watchdog => watchdog !== contextWatchdog
				);

				if ( !pendingContextInitializationsRef.current.length ) {
					setCurrentContextWatchdog( contextWatchdog );
				} else {
					contextWatchdog.destroy();
				}
			} )
			.catch( error => {
				onError( error, {
					phase: 'initialization',
					willContextRestart: false
				} );
			} );

		return contextWatchdog;
	}

	return (
		<ContextWatchdogContext.Provider value={currentContextWatchdog}>
			{props.children}
		</ContextWatchdogContext.Provider>
	);
};

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
