/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Editor, ContextWatchdog, EditorConfig, ContextWatchdogItemConfiguration } from 'ckeditor5';

import { uid } from '@ckeditor/ckeditor5-integrations-common';

/**
 * An adapter aligning the context watchdog API to the editor watchdog API for easier usage.
 */
export class EditorWatchdogAdapter<TEditor extends Editor> {
	/**
	 * The context watchdog instance that will be wrapped into editor watchdog API.
	 */
	private readonly _contextWatchdog: ContextWatchdog;

	/**
	 * A unique id for the adapter to distinguish editor items when using the context watchdog API.
	 */
	private readonly _id: string;

	/**
	 * A watchdog's editor creator function.
	 */
	private _creator?: AdapterEditorCreatorFunction<TEditor>;

	/**
	 * @param contextWatchdog The context watchdog instance that will be wrapped into editor watchdog API.
	 */
	constructor( contextWatchdog: ContextWatchdog ) {
		this._contextWatchdog = contextWatchdog;
		this._id = uid();
	}

	/**
	 *  @param creator A watchdog's editor creator function.
	 */
	public setCreator( creator: AdapterEditorCreatorFunction<TEditor> ): void {
		this._creator = creator;
	}

	/**
	 * Adds an editor configuration to the context watchdog registry. Creates an instance of it.
	 *
	 * @param sourceElementOrData A source element or data for the new editor.
	 * @param config CKEditor 5 editor config.
	 */
	public create( sourceElementOrData: HTMLElement | string, config: EditorConfig ): Promise<unknown>;

	public create( config: EditorConfig ): Promise<unknown>;

	public create( sourceElementOrDataOrConfig: HTMLElement | string | EditorConfig, config?: EditorConfig ): Promise<unknown> {
		let watchdogItemConfiguration: Record<string, any> = {
			creator: this._creator!,
			id: this._id,
			type: 'editor'
		};

		// Newer versions of the editor deprecated passing both source element and config at the same time.
		// So, if the second argument (config) is present, the older version of the editor is being initialized.
		/* istanbul ignore if -- @preserve */
		if ( config ) {
			// <= 47 legacy config approach to watchdog configuration.
			watchdogItemConfiguration = {
				...watchdogItemConfiguration,
				sourceElementOrData: sourceElementOrDataOrConfig,
				config
			};
		} else {
			// >= 48 single config approach to watchdog item configuration.
			watchdogItemConfiguration = {
				...watchdogItemConfiguration,
				config: sourceElementOrDataOrConfig
			};
		}

		return this._contextWatchdog.add( watchdogItemConfiguration as ContextWatchdogItemConfiguration );
	}

	/**
	 * Creates a listener that is attached to context watchdog's item and run when the context watchdog fires.
	 * Currently works only for the `error` event.
	 */
	public on( _: string, callback: ( _: null, data: { error: Error; causesRestart?: boolean } ) => void ): void {
		// Assume that the event name was error.
		this._contextWatchdog.on( 'itemError', ( _, { itemId, error } ) => {
			if ( itemId === this._id ) {
				callback( null, { error, causesRestart: undefined } );
			}
		} );
	}

	public destroy(): Promise<unknown> {
		// Destroying an editor instance after destroying the Context is handled in the `ContextWatchdog` class.
		// As `EditorWatchdogAdapter` is an adapter, we should not destroy the editor manually.
		// Otherwise, it causes that the editor is destroyed twice. However, there is a case, when the editor
		// needs to be removed from the context, without destroying the context itself. We may assume the following
		// relations with `ContextWatchdog#state`:
		//
		// a) `ContextWatchdog#state` === 'ready' - context is not destroyed; it's safe to destroy the editor manually.
		// b) `ContextWatchdog#state` === 'destroyed' - context is destroyed; let `ContextWatchdog` handle the whole process.
		//
		// See #354 for more information.
		if ( this._contextWatchdog.state === 'ready' ) {
			return this._contextWatchdog.remove( this._id );
		}

		return Promise.resolve();
	}

	/**
	 * An editor instance.
	 */
	public get editor(): TEditor {
		return this._contextWatchdog.getItem( this._id ) as TEditor;
	}
}

type AdapterEditorCreatorFunction<TEditor = Editor> =
	| ( ( config: EditorConfig ) => Promise<TEditor> )
	| ( (
		elementOrData: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig
	) => Promise<TEditor> );
