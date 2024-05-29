/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useRef, useState, createContext, useContext, type ReactElement, useEffect } from 'react';
import type { EditorFactory, WatchdogConstructor } from './types';

export const CKEditorFactoriesContext = createContext<CKEditorFactoriesTracking | null>( null );

/**
 * Custom hook that tracks CKEditor factories and provides a way to register and unregister them.
 *
 * @returns An object containing the current watchdog constructor and a function to register a factory.
 */
export const useCKEditorFactoriesTracker = (): CKEditorFactoriesTracking => {
	const [ watchdogConstructor, setWatchdogConstructor ] = useState<{ constructor: WatchdogConstructor } | null>( null );
	const factoriesRef = useRef<Array<CKEditorTrackedFactory>>( [] );

	/**
	 * Removes a tracked factory from the factoriesRef and updates the watchdog constructor.
	 * @param factory - The CKEditorTrackedFactory to be removed.
	 */
	const removeTrackedFactory = ( factory: CKEditorTrackedFactory ) => {
		factoriesRef.current = factoriesRef.current.filter( item => item !== factory );
		setWatchdogConstructor( () => {
			const [ firstFactory ] = factoriesRef.current;

			if ( !firstFactory ) {
				return null;
			}

			return {
				constructor: firstFactory.factory.ContextWatchdog
			};
		} );
	};

	/**
	 * Registers a CKEditor factory and returns a function to unregister it.
	 *
	 * @param factory The CKEditor factory to register.
	 * @returns A function to unregister the factory.
	 */
	const registerFactory = ( factory: EditorFactory ): VoidFunction => {
		const trackedFactory: CKEditorTrackedFactory = {
			factory
		};

		factoriesRef.current.push( trackedFactory );

		if ( !watchdogConstructor ) {
			setWatchdogConstructor( {
				constructor: factory.ContextWatchdog
			} );
		}

		// Unmount callback.
		return () => {
			removeTrackedFactory( trackedFactory );
		};
	};

	return {
		watchdogConstructor: watchdogConstructor && watchdogConstructor.constructor,
		registerFactory
	};
};

/**
 * A component that tracks and registers a CKEditor factory in the CKEditorFactoriesContext.
 */
export const CKEditorFactoryTracker = ( { factory }: { factory: EditorFactory } ): ReactElement | null => {
	const trackerContext = useContext( CKEditorFactoriesContext );

	useEffect( () => {
		if ( !trackerContext ) {
			return undefined;
		}

		return trackerContext.registerFactory( factory );
	}, [] );

	return null;
};

export type CKEditorTrackedFactory = {
	factory: EditorFactory;
};

export type CKEditorFactoriesTracking = {
	watchdogConstructor: WatchdogConstructor | null;
	registerFactory: ( factory: EditorFactory ) => void;
};
