/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState, useEffect, useRef, type Dispatch, type SetStateAction, useContext, useCallback } from 'react';

import type { EditorConfig } from '@ckeditor/ckeditor5-core';
import type { DocumentChangeEvent, Writer, RootElement } from '@ckeditor/ckeditor5-engine';

import { ContextWatchdog, EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';
import type { WatchdogConfig } from '@ckeditor/ckeditor5-watchdog/src/watchdog';

import type { AddRootEvent, DetachRootEvent } from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor';
import type MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
import type EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

import { ContextWatchdogContext } from './ckeditorcontext';
import { EditorWatchdogAdapter } from './ckeditor';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

/* eslint-disable @typescript-eslint/no-use-before-define */
const useMultiRootEditor = ( props: MultiRootHookProps ): MultiRootHookReturns => {
	console.info( props );

	const watchdog = useRef<EditorWatchdog | EditorWatchdogAdapter<MultiRootEditor> | null>( null );

	const editorDestructionInProgress = useRef<Promise<void> | null>( null );

	const context = useContext( ContextWatchdogContext );

	// Current editor instance. It may change if the editor is re-initialized by the Watchdog after an error.
	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );

	// Current editor data. An object where each key is a root name and the value is the root content.
	const [ data, setData ] = useState<Record<string, string>>( props.data );

	// Current roots attributes. An object where each key is a root name and the value is an object with root attributes.
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( props.rootsAttributes || {} );

	// Contains the JSX elements for each editor root.
	const [ elements, setElements ] = useState<Array<JSX.Element>>( [] );

	const shouldUpdateEditor = useRef<boolean>( true );

	useEffect( () => {
		const initEditor = async () => {
			// When the component has been remounted it is crucial to wait for removing the old editor
			// and cleaning the old state.
			await editorDestructionInProgress.current;

			if ( props.isLayoutReady !== false ) {
				await _initializeEditor();
			}
		};

		initEditor();

		return () => {
			_destroyEditor().then( () => {
				editorDestructionInProgress.current = null;
			} );
		};
	}, [ props.isLayoutReady ] );

	useEffect( () => {
		if ( editor ) {
			if ( props.disabled ) {
				editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
			} else {
				editor.disableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
			}
		}
	}, [ props.disabled ] );

	useEffect( () => {
		// When the component has been remounted, keeping the old state, it is important to avoid
		// updating the editor, which will be destroyed by the unmount callback.
		if ( editor && !editorDestructionInProgress.current ) {
			const editorData = editor.getFullData();

			setData( { ...editorData } );
			setAttributes( { ...editor.getRootsAttributes() } );
			setElements( [
				...Object.keys( editorData ).map( rootName => _createEditableElement( editor, rootName ) )
			] );
		}
	}, [ editor && editor.id ] );

	/**
	 * Returns the editor configuration.
	 */
	const _getConfig = (): EditorConfig => {
		const config = props.config || {};

		if ( props.data && config.initialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `data` property. ' +
				'The config value takes precedence over `data` property and will be used when both are specified.'
			);
		}

		return {
			...config,
			rootsAttributes: attributes
		};
	};

	/**
	 * Callback function for handling changed data and attributes in the editor.
	 */
	const onChangeData = ( editor: MultiRootEditor, event: EventInfo ): void => {
		const modelDocument = editor!.model.document;

		if ( !props.disableTwoWayDataBinding ) {
			const newData: Record<string, string> = {};
			const newAttributes: Record<string, Record<string, unknown>> = {};

			modelDocument.differ.getChanges()
				.forEach( change => {
					let root: RootElement;

					if ( change.type == 'insert' || change.type == 'remove' ) {
						root = change.position.root as RootElement;
					} else {
						// Must be `attribute` diff item.
						root = change.range.root as RootElement;
					}

					// Getting data from a not attached root will trigger a warning.
					// There is another callback for handling detached roots.
					if ( !root.isAttached() ) {
						return;
					}

					const { rootName } = root;

					newData[ rootName ] = editor!.getData( { rootName } );
				} );

			modelDocument.differ.getChangedRoots()
				.forEach( changedRoot => {
					// Ignore added and removed roots. They are handled by a different function.
					// Only register if roots attributes changed.
					if ( changedRoot.state ) {
						if ( newData[ changedRoot.name ] !== undefined ) {
							delete newData[ changedRoot.name ];
						}

						return;
					}

					const rootName = changedRoot.name;

					newAttributes[ rootName ] = editor!.getRootAttributes( rootName );
				} );

			if ( Object.keys( newData ).length ) {
				setData( previousData => ( { ...previousData, ...newData } ) );
			}

			if ( Object.keys( newAttributes ).length ) {
				setAttributes( previousAttributes => ( { ...previousAttributes, ...newAttributes } ) );
			}
		}

		/* istanbul ignore else */
		if ( props.onChange ) {
			props.onChange( event, editor! );
		}
	};

	/**
	 * Callback function for handling an added root.
	 */
	const onAddRoot = ( editor: MultiRootEditor, evt: EventInfo, root: RootElement ): void => {
		const rootName = root.rootName;

		const reactElement = _createEditableElement( editor, rootName );

		if ( !props.disableTwoWayDataBinding ) {
			setData( previousData =>
				( { ...previousData, [ rootName ]: editor!.getData( { rootName } ) } )
			);

			setAttributes( previousAttributes =>
				( { ...previousAttributes, [ rootName ]: editor!.getRootAttributes( rootName ) } )
			);
		}

		setElements( previousElements => [ ...previousElements, reactElement ] );
	};

	/**
	 * Callback function for handling a detached root.
	 */
	const onDetachRoot = ( editor: MultiRootEditor, evt: EventInfo, root: RootElement ): void => {
		const rootName = root.rootName;

		setElements( previousElements => previousElements.filter( element => element.props.id !== rootName ) );

		if ( !props.disableTwoWayDataBinding ) {
			setData( previousData => {
				const { [ rootName! ]: _, ...newData } = previousData;

				return { ...newData };
			} );

			setAttributes( previousAttributes => {
				const { [ rootName! ]: _, ...newAttributes } = previousAttributes;

				return { ...newAttributes };
			} );
		}

		editor!.detachEditable( root );
	};

	/**
	 * Creates a React element on which the root editable element is initialized.
	 */
	const _createEditableElement = ( editor: MultiRootEditor, rootName: string ): JSX.Element => (
		<div
			id={rootName}
			key={rootName}
			ref={ el => {
				if ( el ) {
					const editable = editor.ui.view.createEditable( rootName, el );

					editor.ui.addEditable( editable );

					editor.editing.view.forceRender();
				}
			}}
		></div>
	);

	/**
	 * Creates an editor using initial elements or data, and configuration.
	 *
	 * @param initialData The initial data.
	 * @param config CKEditor 5 editor configuration.
	 */
	const _createEditor = (
		initialData: Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig
	): Promise<MultiRootEditor> => {
		return props.editor.create( initialData, config )
			.then( ( editor: MultiRootEditor ) => {
				if ( props.disabled ) {
					// Switch to the read-only mode if the `[disabled]` attribute is specified.
					/* istanbul ignore else */
					if ( props.disabled ) {
						editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
					}
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on<DocumentChangeEvent>( 'change:data', evt => onChangeData( editor, evt ) );

				editor.on<AddRootEvent>( 'addRoot', ( evt, root ) => onAddRoot( editor, evt, root ) );
				editor.on<DetachRootEvent>( 'detachRoot', ( evt, root ) => onDetachRoot( editor, evt, root ) );

				viewDocument.on( 'focus', event => {
					/* istanbul ignore else */
					if ( props.onFocus ) {
						props.onFocus( event, editor );
					}
				} );

				viewDocument.on( 'blur', event => {
					/* istanbul ignore else */
					if ( props.onBlur ) {
						props.onBlur( event, editor );
					}
				} );

				setEditor( editor );

				if ( props.onReady ) {
					props.onReady( editor );
				}

				return editor;
			} );
	};

	/**
	 * Destroys the editor by destroying the watchdog.
	 */
	const _destroyEditor = async (): Promise<void> => {
		setEditor( null );
		setData( {} );
		setAttributes( {} );
		setElements( [] );

		editorDestructionInProgress.current = new Promise<void>( resolve => {
			// It may happen during the tests that the watchdog instance is not assigned before destroying itself. See: #197.
			//
			// Additionally, we need to find a way to detect if the whole context has been destroyed. As `componentWillUnmount()`
			// could be fired by <CKEditorContext /> and <CKEditor /> at the same time, this `setTimeout()` makes sure
			// that <CKEditorContext /> component will be destroyed first, so during the code execution
			// the `ContextWatchdog#state` would have a correct value. See `EditorWatchdogAdapter#destroy()` for more information.
			/* istanbul ignore next */
			setTimeout( async () => {
				if ( watchdog.current ) {
					await watchdog.current.destroy();
					watchdog.current = null;

					return resolve();
				}

				if ( editor ) {
					await editor.destroy();

					return resolve();
				}

				resolve();
			} );
		} );
	};

	/**
	 * Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
	 */
	const _initializeEditor = async (): Promise<void> => {
		if ( props.disableWatchdog ) {
			await _createEditor( props.data, _getConfig() );

			return;
		}

		/* istanbul ignore next */
		if ( watchdog.current ) {
			return;
		}

		if ( context instanceof ContextWatchdog ) {
			watchdog.current = new EditorWatchdogAdapter( context );
		} else {
			watchdog.current = new EditorWatchdog( props.editor, props.watchdogConfig );
		}

		const watchdogInstance = watchdog.current;

		watchdogInstance.setCreator( ( data, config ) => _createEditor( data as Record<string, string>, config ) );

		watchdogInstance.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = props.onError || console.error;

			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		await watchdogInstance
			.create( data as any, _getConfig() )
			.catch( error => {
				const onError = props.onError || console.error;

				onError( error, { phase: 'initialization', willEditorRestart: false } );
			} );
	};

	useEffect( () => {
		if ( !editor ) {
			return;
		}

		// Editor should be only updated when the changes come from the integrator React application.
		if ( shouldUpdateEditor.current ) {
			shouldUpdateEditor.current = false;

			const dataKeys = Object.keys( data );
			const attributesKeys = Object.keys( attributes );

			// Check if `data` and `attributes` have the same keys.
			//
			// It prevents the addition of attributes for non-existing roots.
			// If the `data` object has a different set of keys, an error will not be thrown
			// since the attributes will be removed/added during root initialization/destruction.
			if ( !dataKeys.every( key => attributesKeys.includes( key ) ) ) {
				throw new Error( '`data` and `attributes` objects must have the same keys (roots).' );
			}

			const editorData = editor.getFullData();
			const editorAttributes = editor.getRootsAttributes();

			const {
				addedKeys: newRoots,
				removedKeys: removedRoots
			} = _getStateDiff( editorData, data || {} );

			const hasModifiedData = dataKeys.some( rootName =>
				editorData[ rootName ] !== undefined &&
				JSON.stringify( editorData[ rootName ] ) !== JSON.stringify( data[ rootName ] )
			);

			const rootsWithChangedAttributes = attributesKeys.filter( rootName =>
				JSON.stringify( editorAttributes[ rootName ] ) !== JSON.stringify( attributes[ rootName ] ) );

			editor.model.change( writer => {
				_handleNewRoots( newRoots );
				_handleRemovedRoots( removedRoots );

				if ( hasModifiedData ) {
					_updateEditorData();
				}

				if ( rootsWithChangedAttributes.length ) {
					_updateEditorAttributes( writer, rootsWithChangedAttributes );
				}
			} );
		}
	}, [ data, attributes ] );

	const _getStateDiff = (
		previousState: Record<string, unknown>,
		newState: Record<string, unknown>
	): {
		addedKeys: Array<string>;
		removedKeys: Array<string>;
	} => {
		const previousStateKeys = Object.keys( previousState );
		const newStateKeys = Object.keys( newState );

		return {
			addedKeys: newStateKeys.filter( key => !previousStateKeys.includes( key ) ),
			removedKeys: previousStateKeys.filter( key => !newStateKeys.includes( key ) )
		};
	};

	const _handleNewRoots = ( roots: Array<string> ) => {
		roots.forEach( rootName => {
			editor!.addRoot( rootName, {
				data: data[ rootName ] || '',
				attributes: attributes?.[ rootName ] || {},
				isUndoable: true
			} );
		} );
	};

	const _handleRemovedRoots = ( roots: Array<string> ) => {
		roots.forEach( rootName => {
			editor!.detachRoot( rootName, true );
		} );
	};

	const _updateEditorData = () => {
		// If any of the roots content has changed, set the editor data.
		// Unfortunately, we cannot set the editor data just for one root, so we need to overwrite all roots (`nextProps.data` is an
		// object with data for each root).
		editor!.data.set( data, { suppressErrorInCollaboration: true } as any );
	};

	const _updateEditorAttributes = ( writer: Writer, roots: Array<string> ) => {
		roots.forEach( rootName => {
			Object.keys( attributes![ rootName ] ).forEach( attr => {
				editor!.registerRootAttribute( attr );
			} );

			writer.clearAttributes( editor!.model.document.getRoot( rootName )! );
			writer.setAttributes( attributes![ rootName ], editor!.model.document.getRoot( rootName )! );
		} );
	};

	const _externalSetData: Dispatch<SetStateAction<Record<string, string>>> = useCallback(
		newData => {
			shouldUpdateEditor.current = true;
			setData( newData );
		},
		[ setData ]
	);

	const _externalSetAttributes: Dispatch<SetStateAction<Record<string, Record<string, unknown>>>> = useCallback(
		newAttributes => {
			shouldUpdateEditor.current = true;
			setAttributes( newAttributes );
		},
		[ setAttributes ]
	);

	return {
		editor, editableElements: elements, toolbarElement: <EditorToolbarWrapper editor={editor} />,
		data, setData: _externalSetData,
		attributes, setAttributes: _externalSetAttributes
	};
};

const EditorToolbarWrapper = ( { editor }: any ) => {
	const toolbarRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
		const toolbarContainer = toolbarRef.current;

		if ( !editor || !toolbarContainer ) {
			return undefined;
		}

		const element = editor.ui.view.toolbar.element!;

		if ( toolbarContainer ) {
			toolbarContainer.appendChild( element! );
		}

		return () => {
			if ( toolbarContainer ) {
				toolbarContainer.removeChild( element! );
			}
		};
	}, [ editor && editor.id ] );

	return <div ref={toolbarRef}></div>;
};

export default useMultiRootEditor;

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}

export type MultiRootHookProps = {
	isLayoutReady?: boolean;
	disabled?: boolean;
	data: Record<string, string>;
	rootsAttributes?: Record<string, Record<string, unknown>>;
	editor: typeof MultiRootEditor;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
	disableTwoWayDataBinding?: boolean;

	onReady?: ( editor: MultiRootEditor ) => void;
	onError?: ( error: Error, details: ErrorDetails ) => void;
	onChange?: ( event: EventInfo, editor: MultiRootEditor ) => void;
	onFocus?: ( event: EventInfo, editor: MultiRootEditor ) => void;
	onBlur?: ( event: EventInfo, editor: MultiRootEditor ) => void;

	config?: Record<string, unknown>;
};

export type MultiRootHookReturns = {
	editor: MultiRootEditor | null;
	editableElements: Array<JSX.Element>;
	toolbarElement: JSX.Element;
	data: Record<string, string>;
	setData: Dispatch<SetStateAction<Record<string, string>>>;
	attributes: Record<string, Record<string, unknown>>;
	setAttributes: Dispatch<SetStateAction<Record<string, Record<string, unknown>>>>;
};
