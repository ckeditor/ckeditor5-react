/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, window */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import React from 'react';
import { CKEditorError, ContextWatchdog } from 'ckeditor5';
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import useMultiRootEditor from '../src/useMultiRootEditor.tsx';
import { ContextWatchdogContext } from '../src/ckeditorcontext.tsx';
import { timeout } from './_utils/timeout.js';
import { createDefer } from './_utils/defer.js';
import { TestMultiRootEditor } from './_utils/multirooteditor.js';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';

describe( 'useMultiRootEditor', () => {
	const rootsContent = {
		intro: '<h2>Sample</h2><p>This is an instance of the.</p>',
		content: '<p>It is the custom content</p>'
	};

	const rootsAttributes = {
		intro: {
			row: '1',
			order: 10
		},
		content: {
			row: '1',
			order: 20
		}
	};

	const editorProps = {
		semaphoreElement: null as any,
		editor: TestMultiRootEditor,
		data: rootsContent,
		rootsAttributes,
		config: {
			rootsAttributes
		}
	};

	beforeEach( () => {
		editorProps.semaphoreElement = document.createElement( 'div' );

		vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();

		editorProps.semaphoreElement = null;
	} );

	describe( 'editor', () => {
		it( 'should initialize the MultiRootEditor instance after mounting', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			expect( result.current.editor ).to.be.null;

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );

		it( 'should reinitialize the editor instance after crashing when watchdog is enabled', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, data, attributes } = result.current;

			// Mock the error.
			vi.spyOn( editor!, 'focus' ).mockImplementation( async () => {
				await turnOffDefaultErrorCatching( () => {
					return new Promise( () => {
						setTimeout( () => {
							throw new CKEditorError( 'a-custom-error', editor );
						} );
					} );
				} );
			} );

			// Throw the error.
			editor!.focus();

			await waitFor( () => {
				const { editor: newEditor, data: newData, attributes: newAttributes } = result.current;

				expect( newEditor ).to.be.exist;
				expect( newEditor!.id ).to.not.be.equal( editor!.id );
				expect( newData ).to.deep.equal( data );
				expect( newAttributes ).to.deep.equal( attributes );
			} );
		} );

		it( 'should not initialize the editor when config#isLayoutReady flag is false', async () => {
			const { result, waitFor, rerender } = renderHook( isLayoutReady => useMultiRootEditor( {
				...editorProps,
				isLayoutReady
			} ), { initialProps: false } );

			await timeout( 200 );

			expect( result.current.editor ).to.be.null;
			rerender( true );

			await waitFor( () => {
				expect( result.current.editor ).to.be.exist;
			} );
		} );

		it( 'should bind the editor read-only mode to config#disabled flag', async () => {
			const { result, waitFor, rerender } = renderHook( disabled => useMultiRootEditor( {
				...editorProps,
				disabled
			} ), { initialProps: true } );

			await waitFor( () => {
				expect( result.current.editor!.isReadOnly ).to.be.true;
			} );

			rerender( false );

			await waitFor( () => {
				expect( result.current.editor!.isReadOnly ).to.be.false;
			} );
		} );

		it( 'should initialize the MultiRootEditor instance when watchdog is disabled', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );

		it( 'should initialize the MultiRootEditor instance with context', async () => {
			const contextWatchdog = new ContextWatchdog( TestMultiRootEditor.Context );
			await contextWatchdog.create();

			vi.spyOn( React, 'useContext' ).mockImplementation( arg => {
				if ( arg !== ContextWatchdogContext ) {
					return React.useContext( arg );
				}

				return {
					status: 'initialized',
					watchdog: contextWatchdog
				};
			} );

			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );

		it( 'should not initialize the MultiRootEditor instance with context when watchdog is not initialized', async () => {
			vi.spyOn( React, 'useContext' ).mockImplementation( arg => {
				if ( arg !== ContextWatchdogContext ) {
					return React.useContext( arg );
				}

				return {
					status: 'initializing'
				};
			} );

			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.null;
			} );
		} );
	} );

	describe( 'toolbarElement', () => {
		it( 'should be a component containing toolbar element', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				const { toolbarElement } = result.current;
				const { container } = render( toolbarElement );

				expect( container.getElementsByClassName( 'ck-toolbar' ) ).to.be.exist;
			} );
		} );

		it( 'should be reinitialized after crashing when watchdog is enabled', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, toolbarElement } = result.current;

			vi.spyOn( editor!, 'focus' ).mockImplementation( async () => {
				await turnOffDefaultErrorCatching( () => {
					return new Promise( () => {
						setTimeout( () => {
							throw new CKEditorError( 'a-custom-error', editor );
						} );
					} );
				} );
			} );

			// Throw the error.
			editor!.focus();

			await waitFor( () => {
				const { toolbarElement: newToolbarElement } = result.current;

				expect( newToolbarElement ).to.be.exist;
				expect( newToolbarElement ).to.not.be.equal( toolbarElement );
			} );
		} );
	} );

	describe( 'data and editableElements', () => {
		it( 'should return the initial state', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			const { data, editableElements } = result.current;

			expect( data ).to.deep.equal( rootsContent );
			expect( editableElements.length ).to.equal( 2 );
		} );

		it( 'should update the editor data when the state has been changed', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!.data, 'set' );

			setData( { ...rootsContent, 'intro': 'New data' } );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.intro ).to.equal( '<p>New data</p>' );
				expect( editableElements.length ).to.equal( 2 );
				expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
			} );
		} );

		it( 'should remove the editor root when the key has been removed from the state', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!, 'detachRoot' );

			const newData: Record<string, any> = { ...rootsContent };
			delete newData.intro;

			setData( { ...newData } );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.intro ).to.be.undefined;
				expect( editableElements.length ).to.equal( 1 );
				expect( editor!.getFullData().intro ).to.be.undefined;
			} );
		} );

		it( 'should add the editor root when the key has been added to the state', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData, setAttributes } = result.current;
			const spy = vi.spyOn( editor!, 'addRoot' );

			act( () => {
				setData( { ...rootsContent, 'outro': 'New data' } );
				setAttributes( { ...rootsAttributes, 'outro': {} } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.outro ).to.be.equal( '<p>New data</p>' );
				expect( editableElements.length ).to.equal( 3 );
				expect( editor!.getFullData().outro ).to.be.equal( '<p>New data</p>' );
			} );
		} );

		it( 'should update the state when editor root value has been updated', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;
			editor!.data.set( { ...rootsContent, 'intro': 'New data' } );

			const { data, editableElements } = result.current;

			expect( data.intro ).to.equal( '<p>New data</p>' );
			expect( editableElements.length ).to.equal( 2 );
			expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
		} );

		it( 'should update the state when editor#addRoot is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;
			const spy = vi.spyOn( editor!.ui.view, 'createEditable' );

			act( () => {
				editor!.addRoot( 'outro' );
			} );

			const { data, attributes, editableElements } = result.current;

			render( <div>{editableElements}</div> );

			expect( spy.mock.calls.length ).to.equal( editableElements.length );
			expect( data.outro ).to.equal( '' );
			expect( attributes.outro ).to.deep.equal( { order: null, row: null } );
			expect( editableElements.length ).to.equal( 3 );
			expect( editor!.getFullData().outro ).to.equal( '' );
		} );

		it( 'should update the state when editor#detachRoot is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			expect( result.current.editableElements.length ).to.equal( 2 );

			editor!.detachRoot( 'intro' );

			const { data, editableElements } = result.current;

			expect( data.intro ).to.be.undefined;
			expect( editableElements.length ).to.equal( 1 );
			expect( editor!.getFullData().intro ).to.be.undefined;
		} );

		it( 'should not throw error when data keys do not match attributes', async () => {
			const originalOnError = window.onerror;
			const stubOnError = vi.fn();

			window.onerror = stubOnError;

			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { setData } = result.current;

			const newData: Record<string, any> = { ...rootsContent };
			delete newData.intro;

			act( () => {
				setData( { ...newData } );
			} );

			expect( stubOnError ).not.toHaveBeenCalled();

			window.onerror = originalOnError;
		} );
	} );

	describe( 'attributes', () => {
		it( 'should return the initial state', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { attributes } = result.current;

			expect( attributes ).to.deep.equal( rootsAttributes );
		} );

		it( 'should update the editor attributes when setAttributes is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setAttributes } = result.current;

			act( () => {
				setAttributes( { ...rootsAttributes, 'intro': { foo: 'bar', order: 5 } } );
			} );

			await waitFor( () => {
				const { attributes } = result.current;

				const expectedAttributes = {
					foo: 'bar',
					order: 5,
					row: null
				};

				expect( attributes.intro ).to.deep.equal( expectedAttributes );
				expect( editor!.getRootAttributes( 'intro' ) ).to.deep.equal( expectedAttributes );
			} );
		} );

		it( 'should remove the editor root attribute when the key has been removed from the state', async () => {
			const { result, waitFor, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor, setAttributes } = result.current;

			const newRootsAttributes: Record<string, any> = { ...rootsAttributes };
			newRootsAttributes.intro = {};

			act( () => {
				setAttributes( { ...newRootsAttributes } );
			} );

			await waitFor( () => {
				const { attributes } = result.current;

				expect( attributes.intro ).to.deep.equal( { row: null, order: null } );
				expect( editor!.getRootAttributes( 'intro' ) ).to.deep.equal( { row: null, order: null } );
			} );
		} );

		it( 'should update the state when editor API is called', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor } = result.current;

			await new Promise<void>( res => {
				editor!.model.change( writer => {
					editor!.registerRootAttribute( 'foo' );
					writer.clearAttributes( editor!.model.document.getRoot( 'intro' )! );
					writer.setAttributes( { foo: 'bar', order: 1 }, editor!.model.document.getRoot( 'intro' )! );

					res();
				} );
			} );

			const { attributes } = result.current;

			expect( attributes.intro ).to.deep.equal( {
				order: 1,
				row: null,
				foo: 'bar'
			} );
		} );

		it( 'should throw error when attributes keys do not match data', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { setAttributes } = result.current;

			const newRootsAttributes: Record<string, any> = { ...rootsAttributes };
			delete newRootsAttributes.intro;

			act( () => {
				setAttributes( { ...newRootsAttributes } );
			} );

			expect( console.error ).toHaveBeenCalledWith( '`data` and `attributes` objects must have the same keys (roots).' );
		} );
	} );

	describe( 'callbacks', () => {
		it( 'should call onReady callback when editor has been initialized', async () => {
			const spy = vi.fn();
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onReady: spy
			} ) );

			await waitFor( () => {
				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( result.current.editor );
			} );
		} );

		it( 'should call onError callback when an error has been thrown', async () => {
			const spy = vi.fn();
			const error = new Error( 'Error was thrown.' );

			vi.spyOn( TestMultiRootEditor, 'create' ).mockRejectedValue( error );

			const { waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onError: spy
			} ) );

			await waitFor( () => {
				expect( spy ).toHaveBeenCalledOnce();
				expect( spy ).toHaveBeenCalledWith( error, { phase: 'initialization', willEditorRestart: false } );
			} );
		} );

		it( 'should call onChange callback when the editor has been updated', async () => {
			const spy = vi.fn();
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onChange: spy
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, data } = result.current;

			data.intro = 'new Data';
			editor!.setData( { ...data } );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), editor );
		} );

		it( 'should call onFocus callback when the editor has been focused', async () => {
			const spy = vi.fn();
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onFocus: spy
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			editor!.editing.view.document.fire( 'focus' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), editor );
		} );

		it( 'should call onBlur callback when the editor has been blurred', async () => {
			const spy = vi.fn();
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onBlur: spy
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			editor!.editing.view.document.fire( 'blur', { target: {} } );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), editor );
		} );
	} );

	describe( 'disableTwoWayDataBinding set to `true`', () => {
		it( 'should not update the `data` state when editor root value has been updated', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;
			const getDataSpy = vi.spyOn( editor!, 'getData' );
			editor!.data.set( { ...rootsContent, 'intro': 'New data' } );

			const { data, editableElements } = result.current;

			expect( data.intro ).to.equal( rootsContent.intro );
			expect( editableElements.length ).to.equal( 2 );
			expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
			expect( getDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not update the `data` state when editor#addRoot is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;
			const spy = vi.spyOn( editor!.ui.view, 'createEditable' );

			act( () => {
				editor!.addRoot( 'outro' );
			} );

			const { data, attributes, editableElements } = result.current;

			render( <div>{editableElements}</div> );

			expect( spy.mock.calls.length ).to.equal( editableElements.length );
			expect( data.outro ).to.be.undefined;
			expect( attributes.outro ).to.be.undefined;
			expect( editableElements.length ).to.equal( 3 );
			expect( editor!.getFullData().outro ).to.equal( '' );
		} );

		it( 'should not update the `data` state when editor#detachRoot is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			expect( result.current.editableElements.length ).to.equal( 2 );

			editor!.detachRoot( 'intro' );

			const { data, editableElements } = result.current;

			expect( data.intro ).to.be.equal( rootsContent.intro );
			expect( editableElements.length ).to.equal( 1 );
			expect( editor!.getFullData().intro ).to.be.undefined;
		} );

		it( 'should not update the `attributes` state when editor API is called', async () => {
			const { result, waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			await new Promise<void>( res => {
				editor!.model.change( writer => {
					editor!.registerRootAttribute( 'foo' );
					writer.clearAttributes( editor!.model.document.getRoot( 'intro' )! );
					writer.setAttributes( { foo: 'bar', order: 1 }, editor!.model.document.getRoot( 'intro' )! );

					res();
				} );
			} );

			const { attributes } = result.current;

			expect( editor!.getRootAttributes( 'intro' ) ).to.deep.equal( {
				order: 1,
				row: null,
				foo: 'bar'
			} );
			expect( attributes.intro ).to.be.deep.equal( rootsAttributes.intro );
		} );

		it( 'should call `onChange` callback when editor API is called', async () => {
			const config = {
				...editorProps,
				onChange() {}
			};

			const spy = vi.spyOn( config, 'onChange' );

			const { result, waitFor } = renderHook( () => useMultiRootEditor( config ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, data } = result.current;

			editor!.setData( { ...data, intro: 'New Data' } );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), editor );
		} );
	} );

	describe( 'semaphores', () => {
		const testSemaphoreForWatchdog = enableWatchdog => {
			it( 'should assign properly `data` property to editor even if it is still mounting', async () => {
				const deferInitialization = createDefer();

				class SlowEditor extends TestMultiRootEditor {
					public declare data: any;

					constructor( initialData, config ) {
						super( initialData, config );

						let value = initialData || {};

						this.data = {
							get() {
								return value;
							},

							set( newValue ) {
								value = newValue;
							}
						};
					}

					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						await deferInitialization.promise;

						return new SlowEditor( ...args );
					}
				}

				const { result, waitFor } = renderHook( () => useMultiRootEditor( {
					...editorProps,
					disableWatchdog: !enableWatchdog,
					editor: SlowEditor
				} ) );

				await timeout( 100 );

				result.current.setData( {
					intro: 'Hello World!',
					content: ''
				} );

				await timeout( 200 );

				deferInitialization.resolve();

				await waitFor( () => {
					expect( result.current.editor ).to.be.instanceof( SlowEditor );
					expect( result.current.editor!.data.get() ).to.deep.equal( {
						intro: 'Hello World!',
						content: ''
					} );
				} );
			} );

			it( 'should buffer many rerenders while creating editor', async () => {
				const initializerLog: Array<any> = [];

				class SlowEditor extends TestMultiRootEditor {
					public declare key: any;

					constructor( initialData, config ) {
						super( initialData, config );
						this.key = config.key;
					}

					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						await timeout( 300 );

						return new SlowEditor( ...args );
					}
				}

				const { waitFor, rerender } = renderHook( ( newProps: any ) => useMultiRootEditor( {
					...editorProps,
					disableWatchdog: !enableWatchdog,
					editor: SlowEditor,
					onReady: ( instance: SlowEditor ) => {
						initializerLog.push( {
							status: 'ready',
							id: instance.key
						} );
					},
					onAfterDestroy: ( instance: SlowEditor ) => {
						initializerLog.push( {
							status: 'destroy',
							id: instance.key
						} );
					},
					...newProps
				} ) );

				rerender( {
					id: 111,
					config: {
						key: 2
					}
				} );

				await timeout( 10 );

				rerender( {
					id: 112,
					config: {
						key: 3
					}
				} );

				await timeout( 10 );

				rerender( {
					id: 113,
					config: {
						key: 4
					}
				} );

				await waitFor( () => {
					expect( initializerLog ).to.deep.equal( [
						{ status: 'ready', id: 2 },
						{ status: 'destroy', id: 2 },
						{ status: 'ready', id: 4 }
					] );
				} );
			} );
		};

		for ( const enableWatchdog of [ false, true ] ) {
			describe( `watchdog=${ enableWatchdog }`, () => testSemaphoreForWatchdog( enableWatchdog ) );
		}
	} );
} );
