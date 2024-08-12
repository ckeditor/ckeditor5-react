/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useEffect } from 'react';
import { useRefSafeCallback } from '../hooks/useRefSafeCallback';

import type { CollectionAddEvent, Context, ContextWatchdog, Editor } from 'ckeditor5';
import type { ContextWatchdogValue } from './ckeditorcontext';

import { tryExtractCKEditorReactContextMetadata } from './setCKEditorReactContextMetadata';

/**
 * A hook that listens for the editor initialization and destruction events and updates the editors map.
 *
 * @param config The configuration of the hook.
 * @param config.currentContextWatchdog The current context watchdog value.
 * @param config.onChangeEditorsMap The function that updates the editors map.
 * @example
 * ```ts
 * useInitializedCKEditorsMap( {
 * 	currentContextWatchdog,
 * 	onTrackInitializedEditors: ( editors, context ) => {
 * 		console.log( 'Editors:', editors );
 * 	}
 * } );
 * ```
 */
export const useInitializedCKEditorsMap = <TContext extends Context>(
	{
		currentContextWatchdog,
		onTrackInitializedEditors
	}: InitializedContextEditorsConfig<TContext>
): void => {
	// We need to use the safe callback to prevent the stale closure problem.
	const onTrackInitializedEditorsSafe = useRefSafeCallback( onTrackInitializedEditors || ( () => {} ) );

	useEffect( () => {
		if ( currentContextWatchdog.status !== 'initialized' ) {
			return;
		}

		const { watchdog } = currentContextWatchdog;
		const editors = watchdog?.context?.editors;

		if ( !editors ) {
			return;
		}

		// Get the initialized editors from
		const getInitializedContextEditors = () => [ ...editors ].reduce<InitializedEditorsMap>(
			( map, editor ) => {
				if ( editor.state !== 'ready' ) {
					return map;
				}

				const maybeMetadata = tryExtractCKEditorReactContextMetadata( editor.config );
				const nameOrId = maybeMetadata ? maybeMetadata.editorName : editor.id;

				map[ nameOrId ] = editor;

				return map;
			},
			Object.create( {} ) // Prevent the prototype pollution.
		);

		// The function that is called when the editor status changes.
		const onEditorStatusChange = () => {
			onTrackInitializedEditorsSafe(
				getInitializedContextEditors(),
				watchdog
			);
		};

		// Add the existing editors to the map.
		const onAddEditor = ( _: unknown, editor: Editor ) => {
			editor.once( 'ready', onEditorStatusChange, { priority: 'lowest' } );
			editor.once( 'destroy', onEditorStatusChange, { priority: 'lowest' } );
		};

		editors.on<CollectionAddEvent<Editor>>( 'add', onAddEditor );

		return () => {
			editors.off( 'add', onAddEditor );
		};
	}, [ currentContextWatchdog ] );
};

/**
 * A map of initialized editors.
 */
type InitializedEditorsMap = Record<string, Editor>;

/**
 * The configuration of the `useInitializedCKEditorsMap` hook.
 */
export type InitializedContextEditorsConfig<TContext extends Context> = {

	/**
	 * The current context watchdog value.
	 */
	currentContextWatchdog: ContextWatchdogValue<TContext>;

	/**
	 * The callback called when the editors map changes.
	 */
	onTrackInitializedEditors?: ( editors: InitializedEditorsMap, watchdog: ContextWatchdog<TContext> ) => void;
};
