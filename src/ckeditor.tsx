/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';

import type {
	EventInfo,
	Editor,
	EditorConfig,
	EditorWatchdog,
	WatchdogConfig,
	ContextWatchdog
} from 'ckeditor5';

import type { EditorSemaphoreMountResult } from './lifecycle/LifeCycleEditorSemaphore.js';

import { LifeCycleElementSemaphore } from './lifecycle/LifeCycleElementSemaphore.js';

import {
	withCKEditorReactContextMetadata,
	type CKEditorConfigContextMetadata
} from './context/setCKEditorReactContextMetadata.js';

import {
	ContextWatchdogContext,
	isContextWatchdogInitializing,
	isContextWatchdogReadyToUse
} from './context/ckeditorcontext.js';

import { appendAllIntegrationPluginsToConfig } from './plugins/appendAllIntegrationPluginsToConfig.js';
import { EditorWatchdogAdapter } from './EditorWatchdogAdapter.js';
import {
	assignInitialDataToEditorConfig,
	assignElementToEditorConfig,
	compareInstalledCKBaseVersion,
	getInstalledCKBaseFeatures,
	type EditorRelaxedConstructor
} from '@ckeditor/ckeditor5-integrations-common';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

export default class CKEditor<TEditor extends Editor> extends React.Component<Props<TEditor>> {
	/**
	 * After mounting the editor, the variable will contain a reference to the created editor.
	 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
	 */
	private domContainer = React.createRef<HTMLDivElement>();

	/**
	 * Unlocks element in editor semaphore after destroy editor instance.
	 */
	private editorSemaphore: LifeCycleElementSemaphore<EditorSemaphoreMountResult<TEditor>> | null = null;

	public static override contextType = ContextWatchdogContext;

	constructor( props: Props<TEditor> ) {
		super( props );
		assertMinimumSupportedVersion();
	}

	private get _semaphoreValue(): EditorSemaphoreMountResult<TEditor> | null {
		const { editorSemaphore } = this;

		return editorSemaphore ? editorSemaphore.value : null;
	}

	/**
	 * An watchdog instance.
	 */
	public get watchdog(): EditorWatchdog<TEditor> | EditorWatchdogAdapter<TEditor> | null {
		const { _semaphoreValue } = this;

		return _semaphoreValue ? _semaphoreValue.watchdog : null;
	}

	/**
	 * An editor instance.
	 */
	public get editor(): Editor | null {
		const { _semaphoreValue } = this;

		return _semaphoreValue ? _semaphoreValue.instance : null;
	}

	/**
	 * The CKEditor component should not be updated by React itself.
	 * However, if the component identifier changes, the whole structure should be created once again.
	 */
	public override shouldComponentUpdate( nextProps: Readonly<Props<TEditor>> ): boolean {
		const { props, editorSemaphore } = this;

		// Only when the component identifier changes the whole structure should be re-created once again.
		if ( nextProps.id !== props.id ) {
			return true;
		}

		if ( nextProps.disableWatchdog !== props.disableWatchdog ) {
			return true;
		}

		if ( editorSemaphore ) {
			editorSemaphore.runAfterMount( ( { instance } ) => {
				if ( shouldUpdateEditorData( props, nextProps, instance ) ) {
					instance.data.set( nextProps.data! );
				}
			} );

			if ( 'disabled' in nextProps ) {
				editorSemaphore.runAfterMount( ( { instance } ) => {
					if ( nextProps.disabled ) {
						instance.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
					} else {
						instance.disableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
					}
				} );
			}
		}

		return false;
	}

	/**
	 * Initialize the editor when the component is mounted.
	 */
	public override componentDidMount(): void {
		if ( !isContextWatchdogInitializing( this.context ) ) {
			this._initLifeCycleSemaphore();
		}
	}

	/**
	 * Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
	 */
	public override componentDidUpdate(): void {
		if ( !isContextWatchdogInitializing( this.context ) ) {
			this._initLifeCycleSemaphore();
		}
	}

	/**
	 * Destroy the editor before unmounting the component.
	 */
	public override componentWillUnmount(): void {
		this._unlockLifeCycleSemaphore();
	}

	/**
	 * Async destroy attached editor and unlock element semaphore.
	 */
	private _unlockLifeCycleSemaphore() {
		if ( this.editorSemaphore ) {
			this.editorSemaphore.release();
			this.editorSemaphore = null;
		}
	}

	/**
	 * Unlocks previous editor semaphore and creates new one..
	 */
	private _initLifeCycleSemaphore() {
		this._unlockLifeCycleSemaphore();
		this.editorSemaphore = new LifeCycleElementSemaphore( this.domContainer.current!, {
			isValueValid: value => value && !!value.instance,
			mount: async () => {
				try {
					return await this._initializeEditor();
				} catch ( error: any ) {
					this.props.onError?.( error, { phase: 'initialization', willEditorRestart: false } );

					// Rethrow, let's semaphore handle it.
					throw error;
				}
			},
			afterMount: ( { mountResult } ) => {
				const { onReady } = this.props;

				if ( onReady && this.domContainer.current !== null ) {
					onReady( mountResult.instance );
				}
			},
			unmount: async ( { element, mountResult } ) => {
				const { onAfterDestroy } = this.props;

				try {
					await this._destroyEditor( mountResult );

					/**
					 * Make sure that nothing left in actual editor element. There can be custom integrations that
					 * appends something to container. Let's reset element every update cycle before mounting another
					 * editor instance.
					 */
					element.innerHTML = '';
				} finally {
					/**
					 * Broadcast information about destroying current instance. It is useful for removing duplicated
					 * toolbars in decoupled editor mode.
					 */
					if ( onAfterDestroy ) {
						onAfterDestroy( mountResult.instance );
					}
				}
			}
		} );
	}

	/**
	 * Render a <div> element which will be replaced by CKEditor.
	 */
	public override render(): React.ReactNode {
		return (
			<div ref={ this.domContainer }></div>
		);
	}

	/**
	 * Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
	 */
	private async _initializeEditor(): Promise<EditorSemaphoreMountResult<TEditor>> {
		const supports = getInstalledCKBaseFeatures();
		const {
			editor: Editor,
			disableWatchdog,
			watchdogConfig
		} = this.props;

		const mergedConfig = this._getMergedConfig( true );

		if ( disableWatchdog ) {
			const instance = await this._createEditor( mergedConfig );

			return {
				instance,
				watchdog: null
			};
		}

		const watchdog = ( () => {
			// There is small delay where React did not update the context yet but watchdog is already destroyed.
			// However editor should be created again in such case, after receiving new context.
			if ( isContextWatchdogReadyToUse( this.context ) ) {
				return new EditorWatchdogAdapter( this.context.watchdog );
			}

			return new Editor.EditorWatchdog( Editor, watchdogConfig );
		} )() as EditorWatchdogAdapter<TEditor>;

		watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = this.props.onError ?? console.error;

			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		if ( supports.elementConfigAttachment ) {
			watchdog.setCreator( async ( config: EditorConfig ) => this._watchdogCreateEditor( watchdog, config ) );
			await watchdog.create( mergedConfig );
		} else {
			watchdog.setCreator( async ( _, config ) => this._watchdogCreateEditor( watchdog, config ) );
			await watchdog.create( this.domContainer.current!, mergedConfig );
		}

		return {
			watchdog,
			instance: watchdog!.editor
		};
	}

	/**
	 * Creates editor in watchdog context.
	 *
	 * @param watchdog Watchdog adapter.
	 * @param config Editor configuration.
	 * @returns Editor instance.
	 */
	private async _watchdogCreateEditor( watchdog: EditorWatchdogAdapter<TEditor>, config: EditorConfig ): Promise<TEditor> {
		const { editorSemaphore } = this;
		const { onAfterDestroy, onReady } = this.props;

		const nonFirstCreate = !!editorSemaphore?.value;

		if ( nonFirstCreate && onAfterDestroy ) {
			onAfterDestroy( editorSemaphore.value.instance );
		}

		const instance = await this._createEditor( config );

		// The editor semaphore can be unavailable at this stage. There is a small chance that the component
		// was destroyed while watchdog was initializing new instance of editor. In such case, we should not
		// call any callbacks or set any values to the semaphore.
		if ( nonFirstCreate && editorSemaphore ) {
			editorSemaphore.unsafeSetValue( {
				instance,
				watchdog
			} );

			setTimeout( () => {
				onReady?.( watchdog!.editor as TEditor );
			} );
		}

		return instance;
	}

	/**
	 * Creates an editor from the element and configuration.
	 *
	 * @param config CKEditor 5 editor configuration.
	 * @returns Editor instance.
	 */
	private async _createEditor( config: EditorConfig ): Promise<TEditor> {
		const { editor: Editor } = this.props;
		const supports = getInstalledCKBaseFeatures();

		const mergedConfig = this._getMergedConfig( false, config );
		const editor = await (
			supports.elementConfigAttachment ?
				Editor.create( mergedConfig ) :
				Editor.create( this.domContainer.current! as HTMLElement, mergedConfig )
		);

		// Switch to the read-only mode if the `[disabled]` attribute is specified.
		/* istanbul ignore else -- @preserve */
		if ( this.props.disabled ) {
			editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
		}

		const modelDocument = editor.model.document;
		const viewDocument = editor.editing.view.document;

		modelDocument.on( 'change:data', event => {
			this.props.onChange?.( event, editor );
		} );

		viewDocument.on( 'focus', event => {
			this.props.onFocus?.( event, editor );
		} );

		viewDocument.on( 'blur', event => {
			this.props.onBlur?.( event, editor );
		} );

		return editor;
	}

	/**
	 * It gets an extended configuration containing the entries required for the integration configuration.
	 *
	 * @param resetData Assigns `data` prop value to the configuration if true.
	 * @param config The configuration of the editor.
	 * @returns Shallow copy of config.
	 */
	private _getMergedConfig( resetData?: boolean, config?: EditorConfig ): EditorConfig {
		const { contextItemMetadata, editor: Editor } = this.props;
		const supports = getInstalledCKBaseFeatures();

		let mappedConfig = { ...config ?? this.props.config };

		if ( contextItemMetadata ) {
			mappedConfig = withCKEditorReactContextMetadata( contextItemMetadata, mappedConfig );
		}

		mappedConfig = appendAllIntegrationPluginsToConfig( mappedConfig );

		if ( supports.elementConfigAttachment ) {
			mappedConfig = assignElementToEditorConfig( Editor, this.domContainer.current!, mappedConfig );
		}

		if ( resetData ) {
			mappedConfig = assignInitialDataToEditorConfig( mappedConfig, this.props.data || '' );
		}

		return mappedConfig;
	}

	/**
	 * Destroys the editor by destroying the watchdog.
	 */
	private async _destroyEditor( initializeResult: EditorSemaphoreMountResult<Editor> ): Promise<void> {
		const { watchdog, instance } = initializeResult;

		return new Promise<void>( ( resolve, reject ) => {
			// It may happen during the tests that the watchdog instance is not assigned before destroying itself. See: #197.
			//
			// Additionally, we need to find a way to detect if the whole context has been destroyed. As `componentWillUnmount()`
			// could be fired by <CKEditorContext /> and <CKEditor /> at the same time, this `setTimeout()` makes sure
			// that <CKEditorContext /> component will be destroyed first, so during the code execution
			// the `ContextWatchdog#state` would have a correct value. See `EditorWatchdogAdapter#destroy()` for more information.
			/* istanbul ignore next -- @preserve */
			setTimeout( async () => {
				try {
					if ( watchdog ) {
						await watchdog.destroy();
						return resolve();
					}

					if ( instance ) {
						await instance.destroy();
						return resolve();
					}

					resolve();
				} catch ( e ) {
					console.error( e );
					reject( e );
				}
			} );
		} );
	}
}

/**
 * Returns true when the editor should be updated.
 *
 * @param prevProps Previous react's properties.
 * @param nextProps React's properties.
 * @param editor Current editor instance.
 */
function shouldUpdateEditorData<TEditor extends Editor>(
	prevProps: Readonly<Props<TEditor>>,
	nextProps: Readonly<Props<TEditor>>,
	editor: TEditor
): boolean {
	// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
	// property as a static string and updated a state of component when the editor's content has been changed.
	// If we avoid checking those properties, the editor's content will back to the initial value because
	// the state has been changed and React will call this method.
	if ( prevProps.data === nextProps.data ) {
		return false;
	}

	// We should not change data if the editor's content is equal to the `#data` property.
	if ( editor.data.get() === nextProps.data ) {
		return false;
	}

	return true;
}

/**
 * Checks if currently installed version of the editor is supported by the integration.
 */
function assertMinimumSupportedVersion(): void {
	switch ( compareInstalledCKBaseVersion( '42.0.0' ) ) {
		case null:
			console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
			break;

		case -1:
			console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.' );
			break;
	}
}

export interface Props<TEditor extends Editor> {
	editor: EditorRelaxedConstructor<TEditor> & {
		EditorWatchdog: typeof EditorWatchdog;
		ContextWatchdog: typeof ContextWatchdog;
	};
	contextItemMetadata?: CKEditorConfigContextMetadata;
	config?: EditorConfig;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
	onReady?: ( editor: TEditor ) => void;
	onAfterDestroy?: ( editor: TEditor ) => void;
	onError?: ( error: Error, details: ErrorDetails ) => void;
	onChange?: ( event: EventInfo, editor: TEditor ) => void;
	onFocus?: ( event: EventInfo, editor: TEditor ) => void;
	onBlur?: ( event: EventInfo, editor: TEditor ) => void;
	data?: string;
	disabled?: boolean;
	id?: any;
}

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}
