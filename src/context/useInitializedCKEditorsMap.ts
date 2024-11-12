/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useEffect } from 'react';
import { useRefSafeCallback } from '../hooks/useRefSafeCallback.js';

import type { CollectionAddEvent, Context, ContextWatchdog, Editor, GetCallback } from 'ckeditor5';
import type { ContextWatchdogValue } from './ckeditorcontext.js';

import {
	tryExtractCKEditorReactContextMetadata,
	type CKEditorConfigContextMetadata
} from './setCKEditorReactContextMetadata.js';

/**
 * A hook that listens for the editor initialization and destruction events and updates the editors map.
 *
 * @param config The configuration of the hook.
 * @param config.currentContextWatchdog The current context watchdog value.
 * @param config.onChangeInitializedEditors The function that updates the editors map.
 * @example
 * ```ts
 * useInitializedCKEditorsMap( {
 * 	currentContextWatchdog,
 * 	onChangeInitializedEditors: ( editors, context ) => {
 * 		console.log( 'Editors:', editors );
 * 	}
 * } );
 * ```
 */
export const useInitializedCKEditorsMap = <TContext extends Context>(
	{
		currentContextWatchdog,
		onChangeInitializedEditors
	}: InitializedContextEditorsConfig<TContext>
): void => {
	// We need to use the safe callback to prevent the stale closure problem.
	const onChangeInitializedEditorsSafe = useRefSafeCallback( onChangeInitializedEditors || ( () => {} ) );

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

				const metadata = tryExtractCKEditorReactContextMetadata( editor.config );
				const nameOrId = metadata?.name ?? editor.id;

				map[ nameOrId ] = {
					instance: editor,
					metadata
				};

				return map;
			},
			Object.create( {} ) // Prevent the prototype pollution.
		);

		// The function that is called when the editor status changes.
		const onEditorStatusChange = () => {
			onChangeInitializedEditorsSafe(
				getInitializedContextEditors(),
				watchdog
			);
		};

		// Add the existing editors to the map.
		const trackEditorLifecycle = ( editor: Editor ) => {
			editor.once( 'ready', onEditorStatusChange, { priority: 'lowest' } );
			editor.once( 'destroy', onEditorStatusChange, { priority: 'lowest' } );
		};

		const onAddEditorToCollection: GetCallback<CollectionAddEvent<Editor>> = ( _, editor ) => {
			trackEditorLifecycle( editor );
		};

		editors.forEach( trackEditorLifecycle );
		editors.on<CollectionAddEvent<Editor>>( 'add', onAddEditorToCollection );

		// Fire the initial change event if there is at least one editor ready, otherwise wait for the first ready editor.
		if ( Array.from( editors ).some( editor => editor.state === 'ready' ) ) {
			onEditorStatusChange();
		}

		return () => {
			editors.off( 'add', onAddEditorToCollection );
		};
	}, [ currentContextWatchdog ] );
};

/**
 * A map of initialized editors.
 */
type InitializedEditorsMap = Record<string, {
	instance: Editor;
	metadata: CKEditorConfigContextMetadata | null;
}>;

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
	onChangeInitializedEditors?: (
		editors: InitializedEditorsMap,
		watchdog: ContextWatchdog<TContext>
	) => void;
};
