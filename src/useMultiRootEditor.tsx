/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, {
	forwardRef, useState, useEffect, useRef, useContext, useCallback, memo,
	type Dispatch, type SetStateAction, type RefObject
} from 'react';

import { overwriteArray, overwriteObject, uniq } from '@ckeditor/ckeditor5-integrations-common';

import type {
	InlineEditableUIView,
	EditorConfig,
	DocumentChangeEvent,
	Writer,
	RootElement,
	WatchdogConfig,
	AddRootEvent,
	DetachRootEvent,
	MultiRootEditor,
	EventInfo
} from 'ckeditor5';

import { ContextWatchdogContext, isContextWatchdogReadyToUse } from './context/ckeditorcontext';
import { EditorWatchdogAdapter } from './ckeditor';

import type { EditorSemaphoreMountResult } from './lifecycle/LifeCycleEditorSemaphore';

import { useLifeCycleSemaphoreSyncRef, type LifeCycleSemaphoreSyncRefResult } from './lifecycle/useLifeCycleSemaphoreSyncRef';
import { mergeRefs } from './utils/mergeRefs';
import { LifeCycleElementSemaphore } from './lifecycle/LifeCycleElementSemaphore';
import { useRefSafeCallback } from './hooks/useRefSafeCallback';
import { useInstantEditorEffect } from './hooks/useInstantEditorEffect';

const REACT_INTEGRATION_READ_ONLY_LOCK_ID = 'Lock from React integration (@ckeditor/ckeditor5-react)';

/* eslint-disable @typescript-eslint/no-use-before-define */
const useMultiRootEditor = ( props: MultiRootHookProps ): MultiRootHookReturns => {
	const semaphoreElementRef = useRef<HTMLElement>( props.semaphoreElement || null );
	const semaphore = useLifeCycleSemaphoreSyncRef<LifeCycleMountResult>();

	const editorRefs: LifeCycleSemaphoreRefs<MultiRootEditor> = {
		watchdog: semaphore.createAttributeRef( 'watchdog' ),
		instance: semaphore.createAttributeRef( 'instance' )
	};

	const context = useContext( ContextWatchdogContext );

	// List of editor root elements.
	const [ roots, setRoots ] = useState<Array<string>>( () => Object.keys( props.data ) );

	// Current editor data. An object where each key is a root name and the value is the root content.
	const [ data, setData ] = useState<Record<string, string>>( { ...props.data } );

	// Current roots attributes. An object where each key is a root name and the value is an object with root attributes.
	const [ attributes, setAttributes ] = useState<Record<string, Record<string, unknown>>>( { ...props.rootsAttributes } );

	const shouldUpdateEditor = useRef<boolean>( true );

	/**
	 * It's possible to unmount `useMultiRootEditor` with created editor and `elements` that are not attached to any React node.
	 * It means that CKEditor will try to destroy editor and all it's roots in destructor. It will throw an error because
	 * `editables` are not attached to any React node and their elements references are null. To prevent this error we need to
	 * force assign `editables` to fake elements before destroying editor.
	 *
	 * See: https://github.com/ckeditor/ckeditor5/issues/16561
	 */
	const forceAssignFakeEditableElements = () => {
		const editor = editorRefs.instance.current;

		if ( !editor ) {
			return;
		}

		const initializeEditableWithFakeElement = ( editable: InlineEditableUIView ) => {
			if ( editable.name && !editor.editing.view.getDomRoot( editable.name ) ) {
				editor.editing.view.attachDomRoot( document.createElement( 'div' ), editable.name );
			}
		};

		Object
			.values( editor.ui.view.editables )
			.forEach( initializeEditableWithFakeElement );
	};

	useEffect( () => {
		const semaphoreElement = semaphoreElementRef.current;

		// Check if parent context is ready (only if it is provided).
		if ( context && !isContextWatchdogReadyToUse( context ) ) {
			return;
		}

		// Check if hook internal state or attributes are not ready yet.
		if ( !semaphoreElement || props.isLayoutReady === false ) {
			return;
		}

		semaphore.replace( () => new LifeCycleElementSemaphore( semaphoreElement, {
			mount: _initializeEditor,
			afterMount: ( { mountResult } ) => {
				const { onReady } = props;

				if ( onReady && semaphoreElementRef.current !== null ) {
					onReady( mountResult.instance );
				}
			},
			unmount: async ( { element, mountResult } ) => {
				const { onAfterDestroy } = props;

				try {
					await _destroyEditor( mountResult );

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
		} ) );

		return () => {
			forceAssignFakeEditableElements();
			semaphore.release( false );
		};
	}, [ props.id, props.isLayoutReady, context?.status ] );

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
	const onChangeData = useRefSafeCallback( ( editor: MultiRootEditor, event: EventInfo ): void => {
		const modelDocument = editor!.model.document;

		if ( !props.disableTwoWayDataBinding ) {
			const newData: Record<string, string> = {};
			const newAttributes: Record<string, Record<string, unknown>> = {};

			modelDocument.differ.getChanges()
				.forEach( change => {
					let root: RootElement;

					/* istanbul ignore else -- @preserve */
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

		/* istanbul ignore else -- @preserve */
		if ( props.onChange ) {
			props.onChange( event, editor! );
		}
	} );

	/**
	 * Callback function for handling an added root.
	 */
	const onAddRoot = useRefSafeCallback( ( editor: MultiRootEditor, _evt: EventInfo, root: RootElement ): void => {
		const rootName = root.rootName;

		if ( !props.disableTwoWayDataBinding ) {
			setData( previousData =>
				( { ...previousData, [ rootName ]: editor!.getData( { rootName } ) } )
			);

			setAttributes( previousAttributes =>
				( { ...previousAttributes, [ rootName ]: editor!.getRootAttributes( rootName ) } )
			);
		}

		setRoots( prevRoots => uniq( [ ...prevRoots, root.rootName ] ) );
	} );

	/**
	 * Callback function for handling a detached root.
	 */
	const onDetachRoot = useRefSafeCallback( ( _editor: MultiRootEditor, _evt: EventInfo, root: RootElement ): void => {
		const rootName = root.rootName;

		if ( !props.disableTwoWayDataBinding ) {
			setData( previousData => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { [ rootName! ]: _, ...newData } = previousData;

				return { ...newData };
			} );

			setAttributes( previousAttributes => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { [ rootName! ]: _, ...newAttributes } = previousAttributes;

				return { ...newAttributes };
			} );
		}

		setRoots( prevRoots => prevRoots.filter( root => root !== rootName ) );
	} );

	/**
	 * Creates an editor using initial elements or data, and configuration.
	 *
	 * @param initialData The initial data.
	 * @param config CKEditor 5 editor configuration.
	 */
	const _createEditor = useRefSafeCallback( (
		initialData: Record<string, string> | Record<string, HTMLElement>,
		config: EditorConfig
	): Promise<MultiRootEditor> => {
		overwriteObject( { ...props.rootsAttributes }, attributes );
		overwriteObject( { ...props.data }, data );
		overwriteArray( Object.keys( props.data ), roots );

		return props.editor.create( initialData, config )
			.then( ( editor: MultiRootEditor ) => {
				const editorData = editor.getFullData();

				// Rerender will be called anyway.
				overwriteObject( { ...editorData }, data );
				overwriteObject( { ...editor.getRootsAttributes() }, attributes );
				overwriteArray( Object.keys( editorData ), roots );

				if ( props.disabled ) {
					// Switch to the read-only mode if the `[disabled]` attribute is specified.
					/* istanbul ignore else -- @preserve */
					editor.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on<DocumentChangeEvent>( 'change:data', evt => onChangeData( editor, evt ) );

				editor.on<AddRootEvent>( 'addRoot', ( evt, root ) => onAddRoot( editor, evt, root ) );
				editor.on<DetachRootEvent>( 'detachRoot', ( evt, root ) => onDetachRoot( editor, evt, root ) );

				viewDocument.on( 'focus', event => {
					/* istanbul ignore else -- @preserve */
					if ( props.onFocus ) {
						props.onFocus( event, editor );
					}
				} );

				viewDocument.on( 'blur', event => {
					/* istanbul ignore else -- @preserve */
					if ( props.onBlur ) {
						props.onBlur( event, editor );
					}
				} );

				return editor;
			} );
	} );

	/**
	 * Destroys the editor by destroying the watchdog.
	 */
	const _destroyEditor = ( initializeResult: EditorSemaphoreMountResult<MultiRootEditor> ): Promise<void> => {
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
	};

	/**
	 * Initializes the editor by creating a proper watchdog and initializing it with the editor's configuration.
	 */
	const _initializeEditor = async (): Promise<LifeCycleMountResult> => {
		if ( props.disableWatchdog ) {
			const instance = await _createEditor( props.data as any, _getConfig() );

			return {
				instance: instance as MultiRootEditor,
				watchdog: null
			};
		}

		const watchdog = ( () => {
			if ( isContextWatchdogReadyToUse( context ) ) {
				return new EditorWatchdogAdapter( context.watchdog );
			}

			return new props.editor.EditorWatchdog( props.editor, props.watchdogConfig );
		} )() as EditorWatchdogAdapter<MultiRootEditor>;

		const totalRestartsRef = {
			current: 0
		};

		watchdog.setCreator( async ( data, config ) => {
			const { onAfterDestroy } = props;

			if ( totalRestartsRef.current > 0 && onAfterDestroy && editorRefs.instance.current ) {
				onAfterDestroy( editorRefs.instance.current );
			}

			const instance = await _createEditor( data as any, config );

			if ( totalRestartsRef.current > 0 ) {
				semaphore.unsafeSetValue( {
					instance,
					watchdog
				} );

				setTimeout( () => {
					if ( props.onReady ) {
						props.onReady( watchdog!.editor );
					}
				} );
			}

			totalRestartsRef.current++;
			return instance;
		} );

		watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			const onError = props.onError || console.error;
			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		await watchdog
			.create( data as any, _getConfig() )
			.catch( error => {
				const onError = props.onError || console.error;
				onError( error, { phase: 'initialization', willEditorRestart: false } );
				throw error;
			} );

		return {
			watchdog,
			instance: watchdog!.editor
		};
	};

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

	const _externalSetData: Dispatch<SetStateAction<Record<string, string>>> = useCallback(
		newData => {
			semaphore.runAfterMount( () => {
				shouldUpdateEditor.current = true;
				setData( newData );
			} );
		},
		[ setData ]
	);

	const _externalSetAttributes: Dispatch<SetStateAction<Record<string, Record<string, unknown>>>> = useCallback(
		newAttributes => {
			semaphore.runAfterMount( () => {
				shouldUpdateEditor.current = true;
				setAttributes( newAttributes );
			} );
		},
		[ setAttributes ]
	);

	const toolbarElement = (
		<EditorToolbarWrapper
			ref={ semaphoreElementRef }
			editor={editorRefs.instance.current}
		/>
	);

	useInstantEditorEffect( semaphore.current, ( { instance } ) => {
		if ( props.disabled ) {
			instance.enableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
		} else {
			instance.disableReadOnlyMode( REACT_INTEGRATION_READ_ONLY_LOCK_ID );
		}
	}, [ props.disabled ] );

	useInstantEditorEffect( semaphore.current, ( { instance } ) => {
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
				console.error( '`data` and `attributes` objects must have the same keys (roots).' );
				throw new Error( '`data` and `attributes` objects must have the same keys (roots).' );
			}

			const editorData = instance.getFullData();
			const editorAttributes = instance.getRootsAttributes();

			const {
				addedKeys: newRoots,
				removedKeys: removedRoots
			} = _getStateDiff(
				editorData,
				data || /* istanbul ignore next -- @preserve: It should never happen, data should be always filled. */ {}
			);

			const modifiedRoots = dataKeys.filter( rootName =>
				editorData[ rootName ] !== undefined &&
				JSON.stringify( editorData[ rootName ] ) !== JSON.stringify( data[ rootName ] )
			);

			const rootsWithChangedAttributes = attributesKeys.filter( rootName =>
				JSON.stringify( editorAttributes[ rootName ] ) !== JSON.stringify( attributes[ rootName ] ) );

			const _handleNewRoots = ( roots: Array<string> ) => {
				roots.forEach( rootName => {
					instance!.addRoot( rootName, {
						data: data[ rootName ] || '',
						attributes: attributes?.[ rootName ] ||
						/* istanbul ignore next -- @preserve: attributes should be in sync with root keys */ {},
						isUndoable: true
					} );
				} );
			};

			const _handleRemovedRoots = ( roots: Array<string> ) => {
				roots.forEach( rootName => {
					instance!.detachRoot( rootName, true );
				} );
			};

			const _updateEditorData = ( roots: Array<string> ) => {
				const dataToUpdate = roots.reduce(
					( result, rootName ) => ( { ...result, [ rootName ]: data[ rootName ] } ),
					Object.create( null )
				);
				instance.data.set( dataToUpdate, { suppressErrorInCollaboration: true } as any );
			};

			const _updateEditorAttributes = ( writer: Writer, roots: Array<string> ) => {
				roots.forEach( rootName => {
					Object.keys( attributes![ rootName ] ).forEach( attr => {
						instance.registerRootAttribute( attr );
					} );

					writer.clearAttributes( instance.model.document.getRoot( rootName )! );
					writer.setAttributes( attributes![ rootName ], instance.model.document.getRoot( rootName )! );
				} );
			};

			// React struggles with rerendering during `instance.model.change` callbacks.
			setTimeout( () => {
				instance.model.change( writer => {
					_handleNewRoots( newRoots );
					_handleRemovedRoots( removedRoots );

					if ( modifiedRoots.length ) {
						_updateEditorData( modifiedRoots );
					}

					if ( rootsWithChangedAttributes.length ) {
						_updateEditorAttributes( writer, rootsWithChangedAttributes );
					}
				} );
			} );
		}
	}, [ data, attributes ] );

	const editableElements = roots.map(
		rootName => (
			<EditorEditable
				key={rootName}
				id={rootName}
				rootName={rootName}
				semaphore={semaphore}
			/>
		)
	);

	return {
		editor: editorRefs.instance.current,
		editableElements,
		toolbarElement,
		data, setData: _externalSetData,
		attributes, setAttributes: _externalSetAttributes
	};
};

export const EditorEditable = memo( forwardRef( ( { id, semaphore, rootName }: {
	id: string;
	rootName: string;
	semaphore: LifeCycleSemaphoreSyncRefResult<LifeCycleMountResult>;
}, ref ) => {
	const innerRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
		let editable: InlineEditableUIView | null;
		let editor: MultiRootEditor | null;

		semaphore.runAfterMount( ( { instance } ) => {
			if ( !innerRef.current ) {
				return;
			}

			editor = instance;

			const { ui, model } = editor;
			const root = model.document.getRoot( rootName );

			if ( root && editor.ui.getEditableElement( rootName ) ) {
				editor.detachEditable( root );
			}

			editable = ui.view.createEditable( rootName, innerRef.current );
			ui.addEditable( editable );

			instance.editing.view.forceRender();
		} );

		return () => {
			if ( editor && editor.state !== 'destroyed' && innerRef.current ) {
				const root = editor.model.document.getRoot( rootName );

				/* istanbul ignore else -- @preserve */
				if ( root ) {
					editor.detachEditable( root );
				}
			}
		};
	}, [ semaphore.revision ] );

	return (
		<div
			key={semaphore.revision}
			id={id}
			ref={ mergeRefs( ref, innerRef ) }
		/>
	);
} ) );

EditorEditable.displayName = 'EditorEditable';

export const EditorToolbarWrapper = forwardRef( ( { editor }: any, ref ) => {
	const toolbarRef = useRef<HTMLDivElement>( null );

	useEffect( () => {
		const toolbarContainer = toolbarRef.current;

		if ( !editor || !toolbarContainer ) {
			return undefined;
		}

		const element = editor.ui.view.toolbar.element!;

		toolbarContainer.appendChild( element! );

		return () => {
			if ( toolbarContainer.contains( element ) ) {
				toolbarContainer.removeChild( element! );
			}
		};
	}, [ editor && editor.id ] );

	return <div ref={mergeRefs( toolbarRef, ref )}></div>;
} );

EditorToolbarWrapper.displayName = 'EditorToolbarWrapper';

export default useMultiRootEditor;

type LifeCycleMountResult = EditorSemaphoreMountResult<MultiRootEditor>;

type LifeCycleSemaphoreRefs<TEditor extends MultiRootEditor> = {
	[ K in keyof EditorSemaphoreMountResult<TEditor> ]: RefObject<EditorSemaphoreMountResult<TEditor>[ K ]>
};

interface ErrorDetails {
	phase: 'initialization' | 'runtime';
	willEditorRestart?: boolean;
}

export type MultiRootHookProps = {
	id?: any;
	semaphoreElement?: HTMLElement;

	isLayoutReady?: boolean;
	disabled?: boolean;
	data: Record<string, string>;
	rootsAttributes?: Record<string, Record<string, unknown>>;
	editor: typeof MultiRootEditor;
	watchdogConfig?: WatchdogConfig;
	disableWatchdog?: boolean;
	disableTwoWayDataBinding?: boolean;

	onReady?: ( editor: MultiRootEditor ) => void;
	onAfterDestroy?: ( editor: MultiRootEditor ) => void;
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
