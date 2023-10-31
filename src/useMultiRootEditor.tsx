/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

import React, { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

import uid from '@ckeditor/ckeditor5-utils/src/uid';

import type { Editor, EditorConfig } from '@ckeditor/ckeditor5-core';
import type { DocumentChangeEvent, RootElement, Writer } from '@ckeditor/ckeditor5-engine';

import { ContextWatchdog, EditorWatchdog } from '@ckeditor/ckeditor5-watchdog';
import type { WatchdogConfig } from '@ckeditor/ckeditor5-watchdog/src/watchdog';
import type { EditorCreatorFunction } from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';

import { ContextWatchdogContext } from './ckeditorcontext';
import type { AddRootEvent, DetachRootEvent } from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor';
import type MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';
import type EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

let watchdog: EditorWatchdog | null = null;
let editorDestructionInProgress: Promise<void> | null = null;

/* eslint-disable @typescript-eslint/no-use-before-define */
const useMultiRootEditor = ( props: MultiRootHookProps ): MultiRootHookReturns => {
	// Current editor instance. It may change if the editor is re-initialized by the Watchdog after an error.
	const [ editor, setEditor ] = useState<MultiRootEditor | null>( null );

	// Current editor content. An object where each key is a root name and the value is the root content.
	const [ content, setContent ] = useState<Record<string, string>>( props.content );

	// Current roots attributes. An object where each key is a root name and the value is an object with root attributes.
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( props.rootsAttributes );

	// Contains the JSX elements for each editor root.
	const [ elements, setElements ] = useState<Array<JSX.Element>>( [] );

	useEffect( () => {
		_initializeEditor();

		return () => {
			_destroyEditor();
		};
	}, [] );

	useEffect( () => {
		if ( editor ) {
			const editorData = editor.getFullData();

			setContent( { ...editorData } );
			setAttributes( { ...editor.getRootsAttributes() } );
			setElements( [
				...Object.keys( editorData ).map( rootName => {
					return (
						<div
							id={rootName}
							key={rootName}
							ref={el => {
								if ( el ) {
									const root = editor.model.document.getRoot( rootName )!;
									const editable = editor.createEditable( root );

									// Clear the old value.
									el.innerHTML = '';
									el.appendChild( editable );
								}
							}}
						></div>
					);
				} )
			] );
		}
	}, [ editor ] );

	/**
	 * Returns the editor configuration.
	 */
	const _getConfig = (): EditorConfig => {
		const config = props.config || {};

		if ( props.content && config.initialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `data` properties. ' +
				'The config property is over the data value and the first one will be used when specified both.'
			);
		}

		// Merge two possible ways of providing data into the `config.initialData` field.
		return {
			...config
		};
	};

	/**
	 * Creates an editor from the element and configuration.
	 *
	 * @param initialContent The initial content.
	 * @param config CKEditor 5 editor configuration.
	 */
	const _createEditor = (
		initialContent: Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig
	): Promise<MultiRootEditor> => {
		return props.editor.create( initialContent, config )
			.then( ( editor: MultiRootEditor ) => {
				if ( 'disabled' in props ) {
					// Switch to the read-only mode if the `[disabled]` attribute is specified.
					/* istanbul ignore else */
					if ( props.disabled ) {
						editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
					}
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on<DocumentChangeEvent>( 'change:data', event => {
					const newContent: Record<string, string> = {};
					const newAttributes: Record<string, Record<string, unknown>> = {};

					modelDocument.differ.getChanges()
						.forEach( change => {
							let rootName: string;

							if ( change.type == 'insert' || change.type == 'remove' ) {
								rootName = change.position.root.rootName!;
							} else {
								// Must be `attribute` diff item.
								rootName = change.range.root.rootName!;
							}

							newContent[ rootName ] = editor!.getData( { rootName } );
						} );

					modelDocument.differ.getChangedRoots()
						.forEach( changedRoot => {
							// Ignore added and removed roots. They are handled by a different function.
							// Only register if roots attributes changed.
							if ( changedRoot.state ) {
								if ( newContent[ changedRoot.name ] !== undefined ) {
									delete newContent[ changedRoot.name ];
								}

								return;
							}

							const rootName = changedRoot.name;

							newAttributes[ rootName ] = editor!.getRootAttributes( rootName );
						} );

					if ( Object.keys( newContent ).length ) {
						setContent( previousContent => ( { ...previousContent, ...newContent } ) );
					}

					if ( Object.keys( newAttributes ).length ) {
						setAttributes( previousAttributes => ( { ...previousAttributes, ...newAttributes } ) );
					}

					/* istanbul ignore else */
					if ( props.onChange ) {
						props.onChange( event, editor );
					}
				} );

				editor.on<AddRootEvent>( 'addRoot', ( evt, root ) => {
					const editable = editor.createEditable( root );
					const rootName = root.rootName;

					const reactElement = <div
						ref={ el => {
							if ( el ) {
								el.appendChild( editable );
							}
						} }
						key={ rootName }
						id={ rootName }
					/>;

					// Handling of undo operations.
					if ( content[ rootName ] === undefined ) {
						setContent( previousContent =>
							( { ...previousContent, [ rootName ]: editor.getData( { rootName } ) } )
						);
						setAttributes( previousAttributes =>
							( { ...previousAttributes, [ rootName ]: editor.getRootAttributes( rootName ) } )
						);
					}

					setElements( previousElements => [ ...previousElements, reactElement ] );
				} );

				editor.on<DetachRootEvent>( 'detachRoot', ( evt, root ) => {
					const rootName = root.rootName;

					// Handling of undo operations.
					if ( !content[ rootName ] ) {
						setContent( previousContent => {
							const { [ rootName! ]: _, ...newContent } = previousContent;

							return { ...newContent };
						} );

						setAttributes( previousAttributes => {
							const { [ rootName! ]: _, ...newAttributes } = previousAttributes;

							return { ...newAttributes };
						} );
					}

					setElements( previousElements => previousElements.filter( element => element.props.id !== rootName ) );

					editor.detachEditable( root );
				} );

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
		editorDestructionInProgress = new Promise<void>( resolve => {
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
					watchdog = null;

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
		await editorDestructionInProgress;

		if ( props.disableWatchdog ) {
			await _createEditor( props.content, _getConfig() );
		}

		/* istanbul ignore next */
		if ( watchdog ) {
			return;
		}

		watchdog = new EditorWatchdog( props.editor, props.watchdogConfig );

		// if ( props.context instanceof ContextWatchdog ) {
		// 	// TODO: handle the context
		// 	// this.watchdog = new EditorWatchdogAdapter( this.context );
		// } else {
		//
		// }

		watchdog.setCreator( ( data, config ) => _createEditor( data as Record<string, string>, config ) );

		watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = props.onError || console.error;

			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		await watchdog
			.create( content, _getConfig() )
			.catch( error => {
				const onError = props.onError || console.error;
				onError( error, { phase: 'initialization', willEditorRestart: false } );
			} );
	};

	useEffect( () => {
		if ( !editor ) {
			return;
		}

		const editorData = editor.getFullData();
		const editorAttributes = editor.getRootsAttributes();

		const {
			addedKeys: newRoots,
			removedKeys: removedRoots,
			modifiedKeys: modifiedRoots
		} = _getStateDiff( editorData, content || {} );

		const {
			addedKeys: newAttributes,
			removedKeys: removedAttributes,
			modifiedKeys: modifiedAttributes
		} = _getStateDiff( editorAttributes, attributes || {} );

		const newRootAttributes = newAttributes.filter( rootAttr =>
			!newRoots.includes( rootAttr ) && attributes[ rootAttr ] !== undefined );
		const removedRootAttributes = removedAttributes.filter( rootAttr =>
			!removedRoots.includes( rootAttr ) && attributes[ rootAttr ] !== undefined );
		const modifiedRootAttributes = modifiedAttributes.filter( rootAttr => attributes[ rootAttr ] !== undefined );

		editor.model.change( writer => {
			_handleRoots( newRoots, removedRoots, modifiedRoots );
			_handleRootsAttributes( writer, newRootAttributes, removedRootAttributes, modifiedRootAttributes );
		} );
	}, [ content, attributes ] );

	const _getStateDiff = (
		previousState: Record<string, unknown>,
		newState: Record<string, unknown>
	): {
		addedKeys: Array<string>;
		removedKeys: Array<string>;
		modifiedKeys: Array<string>;
	} => {
		const previousStateKeys = Object.keys( previousState );
		const newStateKeys = Object.keys( newState );

		return {
			addedKeys: newStateKeys.filter( key => !previousStateKeys.includes( key ) ),
			removedKeys: previousStateKeys.filter( key => !newStateKeys.includes( key ) ),
			modifiedKeys: previousStateKeys.filter( key => (
				newStateKeys.includes( key ) &&
				JSON.stringify( previousState[ key ] ) !== JSON.stringify( newState[ key ] )
			) )
		};
	};

	const _handleRoots = (
		newRoots: Array<string>,
		removedRoots: Array<string>,
		modifiedRoots: Array<string>
	) => {
		newRoots.forEach( root => {
			editor!.addRoot( root, {
				data: content[ root ] || '',
				attributes: attributes?.[ root ] || {},
				isUndoable: true
			} );
		} );

		removedRoots.forEach( root => {
			editor!.detachRoot( root, true );
		} );

		// If any of the roots content has changed, set the editor data.
		// Unfortunately, we cannot set the editor data just for one root, so we need to overwrite all roots (`nextProps.data` is an
		// object with data for each root).
		if ( modifiedRoots.length ) {
			editor!.data.set( content, { suppressErrorInCollaboration: true } as any );
		}
	};

	const _handleRootsAttributes = (
		writer: Writer,
		newRootsAttributes: Array<string>,
		removedRootsAttributes: Array<string>,
		modifiedRootsAttributes: Array<string>
	) => {
		[ ...newRootsAttributes, ...modifiedRootsAttributes ].forEach( root => {
			writer.setAttributes( attributes![ root ], editor!.model.document.getRoot( root )! );
		} );

		removedRootsAttributes.forEach( root => {
			writer.clearAttributes( editor!.model.document.getRoot( root )! );
		} );
	};

	return {
		editor, elements,
		content, setContent,
		attributes, setAttributes
	};
};

export default useMultiRootEditor;

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}

export type MultiRootHookProps = {
	content: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
	editor: typeof MultiRootEditor;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;

	onReady?: ( editor: MultiRootEditor ) => void;
	onError?: ( error: Error, details: ErrorDetails ) => void;
	onChange?: ( event: EventInfo, editor: MultiRootEditor ) => void;
	onFocus?: ( event: EventInfo, editor: MultiRootEditor ) => void;
	onBlur?: ( event: EventInfo, editor: MultiRootEditor ) => void;

	config: EditorConfig;
};

export type MultiRootHookReturns = {
	editor: MultiRootEditor | null;
	elements: Array<JSX.Element>;
	content: Record<string, string>;
	setContent: Dispatch<SetStateAction<Record<string, string>>>;
	attributes: Record<string, Record<string, unknown>>;
	setAttributes: Dispatch<SetStateAction<Record<string, Record<string, unknown>>>>;
};
