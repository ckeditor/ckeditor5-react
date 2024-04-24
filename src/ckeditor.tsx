/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import React from 'react';
import PropTypes, { type InferProps, type Validator } from 'prop-types';

import uid from '@ckeditor/ckeditor5-utils/src/uid';

import type { EventInfo } from '@ckeditor/ckeditor5-utils';
import type { Editor, EditorConfig } from '@ckeditor/ckeditor5-core';
import type { DocumentChangeEvent } from '@ckeditor/ckeditor5-engine';

import { EditorWatchdog, ContextWatchdog } from '@ckeditor/ckeditor5-watchdog';
import type { WatchdogConfig } from '@ckeditor/ckeditor5-watchdog/src/watchdog';
import type { EditorCreatorFunction } from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';

import { ContextWatchdogContext } from './ckeditorcontext';
import { LifeCycleEditorElementSemaphore } from './utils/LifeCycleEditorElementSemaphore';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

// eslint-disable-next-line @typescript-eslint/ban-types
export default class CKEditor<TEditor extends Editor> extends React.Component<Props<TEditor>> {
	/**
	 * After mounting the editor, the variable will contain a reference to the created editor.
	 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
	 */
	private domContainer = React.createRef<HTMLDivElement>();

	/**
	 * Unlocks element in editor semaphore after destroy editor instance.
	 */
	private editorSemaphore: LifeCycleEditorElementSemaphore<EditorMountResult<TEditor>> | null = null;

	constructor( props: Props<TEditor> ) {
		super( props );

		const { CKEDITOR_VERSION } = window;

		if ( CKEDITOR_VERSION ) {
			const [ major ] = CKEDITOR_VERSION.split( '.' ).map( Number );

			if ( major < 37 ) {
				console.warn( 'The <CKEditor> component requires using CKEditor 5 in version 37 or higher.' );
			}
		} else {
			console.warn( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
		}
	}

	private get _semaphoreValue(): EditorMountResult<TEditor> | null {
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
	public override shouldComponentUpdate( nextProps: Readonly<Props<TEditor>>, nextState: any ): boolean {
		// Only when the component identifier changes the whole structure should be re-created once again.
		if ( nextProps.id !== this.props.id ) {
			return true;
		}

		if ( nextProps.disableWatchdog !== this.props.disableWatchdog ) {
			return true;
		}

		if ( this.editor ) {
			if ( this._shouldUpdateEditor( nextProps ) ) {
				this.editor.data.set( nextProps.data! );
			}

			if ( 'disabled' in nextProps ) {
				if ( nextProps.disabled ) {
					this.editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
				} else {
					this.editor.disableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
				}
			}
		}

		return false;
	}

	/**
	 * Initialize the editor when the component is mounted.
	 */
	public override componentDidMount(): void {
		this._initLifeCycleSemaphore();
	}

	/**
	 * Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
	 */
	public override componentDidUpdate(): void {
		this._initLifeCycleSemaphore();
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
		this.editorSemaphore = new LifeCycleEditorElementSemaphore( this.domContainer.current!, {
			mount: async () => this._initializeEditor(),
			afterMount: ( { mountResult } ) => {
				const { onReady } = this.props;

				if ( onReady && this.domContainer.current !== null ) {
					onReady( mountResult.instance );
				}
			},
			unmount: async ( { element, mountResult } ) => {
				const { onAfterDestroy } = this.props;

				await this._destroyEditor( mountResult );

				/**
				 * Make sure that nothing left in actual editor element. There can be custom integrations that
				 * appends something to container. Let's reset element every update cycle before mounting another
				 * editor instance.
				 */
				element.innerHTML = '';

				/**
				 * Broadcast information about destroying current instance. It is useful for removing duplicated
				 * toolbars in decoupled editor mode.
				 */
				if ( onAfterDestroy ) {
					onAfterDestroy( mountResult.instance );
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
	private async _initializeEditor(): Promise<EditorMountResult<TEditor>> {
		if ( this.props.disableWatchdog ) {
			const instance = await this._createEditor( this.domContainer.current!, this._getConfig() );

			return {
				instance: instance as TEditor,
				watchdog: null
			};
		}

		const watchdog = ( () => {
			if ( this.context instanceof ContextWatchdog ) {
				return new EditorWatchdogAdapter( this.context );
			}

			return new CKEditor._EditorWatchdog( this.props.editor, this.props.watchdogConfig );
		} )() as EditorWatchdogAdapter<TEditor>;

		const totalRestartsRef = {
			current: 0
		};

		watchdog.setCreator( async ( el, config ) => {
			const { editorSemaphore } = this;
			const { onAfterDestroy } = this.props;

			if ( totalRestartsRef.current > 0 &&
					onAfterDestroy &&
					editorSemaphore &&
					editorSemaphore.value &&
					editorSemaphore.value.instance ) {
				onAfterDestroy( editorSemaphore.value.instance );
			}

			const instance = await this._createEditor( el as any, config );

			if ( totalRestartsRef.current > 0 ) {
				editorSemaphore!.unsafeSetValue( {
					instance,
					watchdog
				} );

				setTimeout( () => {
					if ( this.props.onReady ) {
						this.props.onReady( watchdog!.editor as TEditor );
					}
				} );
			}

			totalRestartsRef.current++;
			return instance;
		} );

		watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = this.props.onError || console.error;
			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		await watchdog
			.create( this.domContainer.current!, this._getConfig() )
			.catch( error => {
				const onError = this.props.onError || console.error;
				onError( error, { phase: 'initialization', willEditorRestart: false } );
			} );

		return {
			watchdog,
			instance: watchdog!.editor
		};
	}

	/**
	 * Creates an editor from the element and configuration.
	 *
	 * @param element The source element.
	 * @param config CKEditor 5 editor configuration.
	 */
	private _createEditor( element: HTMLElement | string | Record<string, string>, config: EditorConfig ): Promise<TEditor> {
		return this.props.editor.create( element as HTMLElement, config )
			.then( editor => {
				if ( 'disabled' in this.props ) {
					// Switch to the read-only mode if the `[disabled]` attribute is specified.
					/* istanbul ignore else */
					if ( this.props.disabled ) {
						editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
					}
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on<DocumentChangeEvent>( 'change:data', event => {
					/* istanbul ignore else */
					if ( this.props.onChange ) {
						this.props.onChange( event, editor );
					}
				} );

				viewDocument.on( 'focus', event => {
					/* istanbul ignore else */
					if ( this.props.onFocus ) {
						this.props.onFocus( event, editor );
					}
				} );

				viewDocument.on( 'blur', event => {
					/* istanbul ignore else */
					if ( this.props.onBlur ) {
						this.props.onBlur( event, editor );
					}
				} );

				return editor;
			} );
	}

	/**
	 * Destroys the editor by destroying the watchdog.
	 */
	private async _destroyEditor( initializeResult: EditorMountResult<Editor> ): Promise<void> {
		const { watchdog, instance } = initializeResult;

		return new Promise<void>( resolve => {
			// It may happen during the tests that the watchdog instance is not assigned before destroying itself. See: #197.
			//
			// Additionally, we need to find a way to detect if the whole context has been destroyed. As `componentWillUnmount()`
			// could be fired by <CKEditorContext /> and <CKEditor /> at the same time, this `setTimeout()` makes sure
			// that <CKEditorContext /> component will be destroyed first, so during the code execution
			// the `ContextWatchdog#state` would have a correct value. See `EditorWatchdogAdapter#destroy()` for more information.
			/* istanbul ignore next */
			setTimeout( async () => {
				if ( watchdog ) {
					await watchdog.destroy();
					return resolve();
				}

				if ( instance ) {
					await instance.destroy();
					return resolve();
				}

				resolve();
			} );
		} );
	}

	/**
	 * Returns true when the editor should be updated.
	 *
	 * @param nextProps React's properties.
	 */
	private _shouldUpdateEditor( nextProps: Readonly<Props<TEditor>> ): boolean {
		// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
		// property as a static string and updated a state of component when the editor's content has been changed.
		// If we avoid checking those properties, the editor's content will back to the initial value because
		// the state has been changed and React will call this method.
		if ( this.props.data === nextProps.data ) {
			return false;
		}

		// We should not change data if the editor's content is equal to the `#data` property.
		if ( this.editor!.data.get() === nextProps.data ) {
			return false;
		}

		return true;
	}

	/**
	 * Returns the editor configuration.
	 */
	private _getConfig(): EditorConfig {
		const config = this.props.config || {};

		if ( this.props.data && config.initialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `content` property. ' +
				'The config value takes precedence over `content` property and will be used when both are specified.'
			);
		}

		// Merge two possible ways of providing data into the `config.initialData` field.
		return {
			...config,
			initialData: config.initialData || this.props.data || ''
		};
	}

	public static override contextType = ContextWatchdogContext;

	// Properties definition.
	public static propTypes = {
		editor: PropTypes.func.isRequired as unknown as Validator<{ create( ...args: any ): Promise<any> }>,
		data: PropTypes.string,
		config: PropTypes.object,
		disableWatchdog: PropTypes.bool,
		watchdogConfig: PropTypes.object,
		onChange: PropTypes.func,
		onReady: PropTypes.func,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onError: PropTypes.func,
		disabled: PropTypes.bool,
		id: PropTypes.any
	};

	// Store the API in the static property to easily overwrite it in tests.
	// Too bad dependency injection does not work in Webpack + ES 6 (const) + Babel.
	public static _EditorWatchdog = EditorWatchdog;
}

/**
 * TODO this is type space definition for props, the CKEditor.propTypes is a run-time props validation that should match.
 */
interface Props<TEditor extends Editor> extends InferProps<typeof CKEditor.propTypes> {
	editor: { create( ...args: any ): Promise<TEditor> };
	config?: EditorConfig;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
	onReady?: ( editor: TEditor ) => void;
	onAfterDestroy?: ( Editor: TEditor ) => void;
	onError?: ( error: Error, details: ErrorDetails ) => void;
	onChange?: ( event: EventInfo, editor: TEditor ) => void;
	onFocus?: ( event: EventInfo, editor: TEditor ) => void;
	onBlur?: ( event: EventInfo, editor: TEditor ) => void;
}

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}

interface EditorMountResult<TEditor extends Editor> {

	/**
	 * Holds the instance of the editor if `props.disableWatchdog` is set to true.
	 */
	instance: TEditor;

	/**
	 * An instance of EditorWatchdog or an instance of EditorWatchdog-like adapter for ContextWatchdog.
	 * It holds the instance of the editor under `this.watchdog.editor` if `props.disableWatchdog` is set to false.
	 */
	watchdog: EditorWatchdog<TEditor> | EditorWatchdogAdapter<TEditor> | null;
}

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
	private _creator?: EditorCreatorFunction;

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
	public setCreator( creator: EditorCreatorFunction ): void {
		this._creator = creator;
	}

	/**
	 * Adds an editor configuration to the context watchdog registry. Creates an instance of it.
	 *
	 * @param sourceElementOrData A source element or data for the new editor.
	 * @param config CKEditor 5 editor config.
	 */
	public create( sourceElementOrData: HTMLElement | string, config: EditorConfig ): Promise<unknown> {
		return this._contextWatchdog.add( {
			sourceElementOrData,
			config,
			creator: this._creator!,
			id: this._id,
			type: 'editor'
		} );
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
