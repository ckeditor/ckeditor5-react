/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
import type { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import type MultiRootEditorUI from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditorui';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

// eslint-disable-next-line @typescript-eslint/ban-types
export default class CKEditor<TEditor extends Editor> extends React.Component<Props<TEditor>, {}> {
	/**
	 * Contains a promise that resolves when the editor destruction is finished.
	 */
	private editorDestructionInProgress: Promise<void> | null = null;

	/**
	 * After mounting the editor, the variable will contain a reference to the created editor.
	 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
	 */
	private domContainer = React.createRef<HTMLDivElement>();

	/**
	 * An instance of EditorWatchdog or an instance of EditorWatchdog-like adapter for ContextWatchdog.
	 * It holds the instance of the editor under `this.watchdog.editor` if `props.disableWatchdog` is set to false.
	 */
	private watchdog: EditorWatchdog<TEditor> | EditorWatchdogAdapter<TEditor> | null = null;

	/**
	 * Holds the instance of the editor if `props.disableWatchdog` is set to true.
	 */
	private instance: Editor | undefined | null;

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

	/**
	 * An editor instance.
	 */
	public get editor(): Editor | null {
		if ( this.props.disableWatchdog ) {
			return this.instance!;
		}

		if ( !this.watchdog ) {
			return null;
		}

		return this.watchdog.editor;
	}

	/**
	 * The CKEditor component should not be updated by React itself.
	 * However, if the component identifier changes, the whole structure should be created once again.
	 */
	public override shouldComponentUpdate( nextProps: Readonly<Props<TEditor>> ): boolean {
		if ( !this.editor ) {
			return false;
		}

		// Only when the component identifier changes the whole structure should be re-created once again.
		if ( nextProps.id !== this.props.id ) {
			return true;
		}

		if ( nextProps.disableWatchdog !== this.props.disableWatchdog ) {
			return true;
		}

		this._handleEditorState( nextProps );

		if ( 'disabled' in nextProps ) {
			if ( nextProps.disabled ) {
				this.editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
			} else {
				this.editor.disableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
			}
		}

		return false;
	}

	/**
	 * Initialize the editor when the component is mounted.
 	 */
	public override async componentDidMount(): Promise<void> {
		await this._initializeEditor();
	}

	/**
	 * Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
	 */
	public override async componentDidUpdate(): Promise<void> {
		await this._destroyEditor();
		await this._initializeEditor();
	}

	/**
	 * Destroy the editor before unmounting the component.
 	 */
	public override async componentWillUnmount(): Promise<void> {
		await this._destroyEditor();
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
	private async _initializeEditor(): Promise<unknown> {
		await this.editorDestructionInProgress;

		if ( this.props.disableWatchdog ) {
			this.instance = await this._createEditor( this.domContainer.current!, this._getConfig() );
			return;
		}

		/* istanbul ignore next */
		if ( this.watchdog ) {
			return;
		}

		if ( this.context instanceof ContextWatchdog ) {
			this.watchdog = new EditorWatchdogAdapter( this.context );
		} else {
			this.watchdog = new CKEditor._EditorWatchdog( this.props.editor, this.props.watchdogConfig );
		}

		this.watchdog.setCreator( ( el, config ) => this._createEditor( el, config ) );

		this.watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = this.props.onError || console.error;
			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		await this.watchdog
			.create( this.props.sourceElements as any || this.domContainer.current!, this._getConfig() )
			.catch( error => {
				const onError = this.props.onError || console.error;
				onError( error, { phase: 'initialization', willEditorRestart: false } );
			} );
	}

	/**
	 * Creates an editor from the element and configuration.
	 *
	 * @param element The source element.
	 * @param config CKEditor 5 editor configuration.
	 */
	private _createEditor(
		element: HTMLElement | string | Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig
	): Promise<TEditor> {
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
					const changedRoots: ChangedRoots = {};

					modelDocument.differ.getChanges()
						.forEach( change => {
							if ( 'position' in change && change.position.root.isAttached() ) {
								const { rootName } = change.position.root;

								changedRoots[ rootName! ] = { changedData: true };
							}
						} );

					modelDocument.differ.getChangedRoots()
						.forEach( changedRoot => {
							const rootName = changedRoot.name;

							changedRoots[ rootName! ] = { ...changedRoots[ rootName! ], changedAttributes: true };
						} );

					/* istanbul ignore else */
					if ( this.props.onChange ) {
						this.props.onChange( event, editor, changedRoots );
					}
				} );

				editor.on( 'addRoot', ( evt, root ) => {
					if ( this.props.onAddRoot ) {
						const reactElement = ( props?: Record<string, unknown> ) => <div
							ref={ el => {
								const editorUI = editor.ui as MultiRootEditorUI;
								const editable = editorUI.view.createEditable( root.rootName, el! );

								editorUI.addEditable( editable );

								editor.editing.view.forceRender();
							} }
							key={ root.rootName }
							id={ root.rootName }
							{...props}
						/>;

						const attributes: Record<string, unknown> = {};

						for ( const [ key, value ] of root.getAttributes() ) {
							attributes[ key ] = value;
						}

						this.props.onAddRoot( reactElement, attributes );
					}
				} );

				editor.on( 'detachRoot', ( evt, root ) => {
					if ( this.props.onRemoveRoot ) {
						this.props.onRemoveRoot( root );

						( editor as any ).detachEditable( root );
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

				// The `onReady` callback should be fired once the `editor` property
				// can be reached from the `<CKEditor>` component.
				// Ideally this part should be moved to the watchdog item creator listeners.
				setTimeout( () => {
					if ( this.props.onReady ) {
						this.props.onReady( editor );
					}
				} );

				return editor;
			} );
	}

	/**
	 * Destroys the editor by destroying the watchdog.
	 */
	private async _destroyEditor(): Promise<void> {
		this.editorDestructionInProgress = new Promise<void>( resolve => {
			// It may happen during the tests that the watchdog instance is not assigned before destroying itself. See: #197.
			//
			// Additionally, we need to find a way to detect if the whole context has been destroyed. As `componentWillUnmount()`
			// could be fired by <CKEditorContext /> and <CKEditor /> at the same time, this `setTimeout()` makes sure
			// that <CKEditorContext /> component will be destroyed first, so during the code execution
			// the `ContextWatchdog#state` would have a correct value. See `EditorWatchdogAdapter#destroy()` for more information.
			/* istanbul ignore next */
			setTimeout( async () => {
				if ( this.watchdog ) {
					await this.watchdog.destroy();
					this.watchdog = null;
					return resolve();
				}

				if ( this.instance ) {
					await this.instance.destroy();
					this.instance = null;
					return resolve();
				}

				resolve();
			} );
		} );
	}

	private getStateDiff( previousState: Record<string, unknown>, newState: Record<string, unknown> ):
		{ addedKeys: Array<string>; removedKeys: Array<string>; modifiedKeys: Array<string> } {
		const previousStateKeys = Object.keys( previousState );
		const newStateKeys = Object.keys( newState );

		return {
			addedKeys: newStateKeys.filter( key => previousStateKeys.indexOf( key ) === -1 ),
			removedKeys: previousStateKeys.filter( key => newStateKeys.indexOf( key ) === -1 ),
			modifiedKeys: previousStateKeys.filter( key => newStateKeys.indexOf( key ) !== -1 &&
				JSON.stringify( previousState[ key ] ) !== JSON.stringify( newState[ key ] ) )
		};
	}

	private _handleRoots = (
		nextProps: any,
		newRoots: Array<string>,
		removedRoots: Array<string>,
		modifiedRoots: Array<string>
	) => {
		newRoots.forEach( root => {
			( this.editor as any ).addRoot( root, { attributes: nextProps.attributes[ root ] } );
		} );

		removedRoots.forEach( root => {
			( this.editor as any ).detachRoot( root, true );
		} );

		for ( const modifiedRoot of modifiedRoots ) {
			if ( this.editor!.data.get( { rootName: modifiedRoot } ) !== nextProps.data[ modifiedRoot ] ) {
				this.editor!.data.set( nextProps.data! );

				break;
			}
		}
	};

	private _handleRootsAttributes = (
		writer: any,
		nextProps: any,
		newRootsAttributes: Array<string>,
		removedRootsAttributes: Array<string>,
		modifiedRootsAttributes: Array<string>
	) => {
		[ ...newRootsAttributes, ...modifiedRootsAttributes ].forEach( root => {
			writer.setAttributes( nextProps.attributes[ root ], this.editor!.model.document.getRoot( root ) );
		} );

		removedRootsAttributes.forEach( root => {
			writer.setAttributes( {}, this.editor!.model.document.getRoot( root ) );
		} );
	};

	/**
	 * Returns true when the editor should be updated.
	 *
	 * @param nextProps React's properties.
	 */
	private _handleEditorState( nextProps: Readonly<Props<TEditor>> ): void {
		// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
		// property as a static string and updated a state of component when the editor's content has been changed.
		// If we avoid checking those properties, the editor's content will back to the initial value because
		// the state has been changed and React will call this method.
		if ( this.props.data === nextProps.data && this.props.attributes === nextProps.attributes ) {
			return;
		}

		const roots = Object.keys( this.props.data );

		// We should not change data if the editor's content is equal to the `#data` property.
		if ( roots && 'getFullData' in this.editor! ) {
			const editor = this.editor as MultiRootEditor;

			const editorData = editor.getFullData();
			const editorAttributes = editor.getRootsAttributes();

			const { addedKeys: newRoots, removedKeys: removedRoots, modifiedKeys: modifiedRoots } =
				this.getStateDiff( editorData, nextProps.data );
			const { addedKeys: newAttributes, removedKeys: removedAttributes, modifiedKeys: modifiedAttributes } =
				this.getStateDiff( editorAttributes, nextProps.attributes );

			const newRootAttributes = newAttributes.filter( rootAttr =>
				newRoots.indexOf( rootAttr ) === -1 && nextProps.data[ rootAttr ] );
			const removedRootAttributes = removedAttributes.filter( rootAttr =>
				removedRoots.indexOf( rootAttr ) === -1 && nextProps.data[ rootAttr ] );
			const modifiedRootAttributes = modifiedAttributes.filter( rootAttr => nextProps.data[ rootAttr ] );

			editor.model.change( writer => {
				this._handleRoots( nextProps, newRoots, removedRoots, modifiedRoots );
				this._handleRootsAttributes( writer, nextProps, newRootAttributes, removedRootAttributes, modifiedRootAttributes );
			} );
		} else if ( this.editor!.data.get() !== nextProps.data ) {
			this.editor!.data.set( nextProps.data! );
		}
	}

	/**
	 * Returns the editor configuration.
	 */
	private _getConfig(): EditorConfig {
		const config = this.props.config || {};

		if ( this.props.data && config.initialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `data` properties. ' +
				'The config property is over the data value and the first one will be used when specified both.'
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
		data: PropTypes.any,
		attributes: PropTypes.any,
		sourceElements: PropTypes.object,
		config: PropTypes.object,
		disableWatchdog: PropTypes.bool,
		watchdogConfig: PropTypes.object,
		onChange: PropTypes.func,
		onReady: PropTypes.func,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onAddRoot: PropTypes.func,
		onRemoveRoot: PropTypes.func,
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
	onError?: ( error: Error, details: ErrorDetails ) => void;
	onChange?: ( event: EventInfo, editor: TEditor, changedRoots: ChangedRoots ) => void;
	onFocus?: ( event: EventInfo, editor: TEditor ) => void;
	onBlur?: ( event: EventInfo, editor: TEditor ) => void;
	onAddRoot?: ( createElement: () => JSX.Element, attributes: Record<string, unknown> ) => void;
	onRemoveRoot?: ( root: any ) => void;
}

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}

type ChangedRoots = Record<string, { changedData?: boolean; changedAttributes?: boolean }>;

/**
 * An adapter aligning the context watchdog API to the editor watchdog API for easier usage.
 */
class EditorWatchdogAdapter<TEditor extends Editor> {
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
