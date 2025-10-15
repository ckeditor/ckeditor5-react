/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import React, { useEffect } from 'react';
import { CKEditorError } from 'ckeditor5';
import { render, waitFor, renderHook, act } from '@testing-library/react';
import useMultiRootEditor, { EditorEditable, EditorToolbarWrapper } from '../src/useMultiRootEditor.js';
import { ContextWatchdogContext } from '../src/context/ckeditorcontext.js';
import { timeout } from './_utils/timeout.js';
import { createDefer } from './_utils/defer.js';
import { createTestMultiRootWatchdog, TestMultiRootEditor } from './_utils/multirooteditor.js';
import { turnOffErrors } from './_utils/turnOffErrors.js';
import { ReactIntegrationUsageDataPlugin } from '../src/plugins/ReactIntegrationUsageDataPlugin.js';

describe( 'useMultiRootEditor', () => {
	const rootsContent = {
		intro: '<h2>Sample</h2><p>This is an instance of the.</p>',
		content: '<p>It is the custom content</p>',
		footer: '<p>Footer content</p>'
	};

	const rootsAttributes = {
		intro: {
			row: '1',
			order: 10
		},
		content: {
			row: '1',
			order: 20
		},
		footer: {
			row: '2',
			order: 30
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

	describe( 'editor props', () => {
		it( 'should raise proper warning when `data` and `initialData` is passed to config at the same time', async () => {
			const spy = vi.spyOn( console, 'warn' );

			renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true,
				config: {
					...editorProps.config,
					initialData: rootsContent
				}
			} ) );

			await waitFor( () => {
				expect( spy ).toHaveBeenCalledWith(
					'Editor data should be provided either using `config.initialData` or `data` property. ' +
					'The config value takes precedence over `data` property and will be used when both are specified.'
				);
			} );
		} );

		it( 'should not crash if config property is not provided', async () => {
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true,
				config: undefined
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );
	} );

	describe( 'editor', () => {
		it( 'should initialize the MultiRootEditor instance after mounting', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			expect( result.current.editor ).to.be.null;

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
				expect( result.current.editor?.plugins ).to.include( ReactIntegrationUsageDataPlugin );
			} );
		} );

		it( 'should reinitialize the editor instance after crashing when watchdog is enabled', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, data, attributes } = result.current;

			// Mock the error.
			vi.spyOn( editor!, 'focus' ).mockImplementation( async () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
				} );
			} );

			await turnOffErrors( async () => {
				editor!.focus();
			} );

			await waitFor( () => {
				const { editor: newEditor, data: newData, attributes: newAttributes } = result.current;

				expect( newEditor ).to.be.exist;
				expect( newEditor!.id ).to.not.be.equal( editor!.id );
				expect( newData ).to.deep.equal( data );
				expect( newAttributes ).to.deep.equal( attributes );
			} );
		} );

		it( 'should not initialize the editor when config#isLayoutReady flag is false', async () => {
			const { result, rerender } = renderHook( isLayoutReady => useMultiRootEditor( {
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
			const { result, rerender } = renderHook( disabled => useMultiRootEditor( {
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
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );
	} );

	describe( 'toolbarElement', () => {
		it( 'should be a component containing toolbar element', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				const { toolbarElement } = result.current;
				const { container } = render( toolbarElement );

				expect( container.getElementsByClassName( 'ck-toolbar' ) ).to.be.exist;
			} );
		} );

		it( 'should be reinitialized after crashing when watchdog is enabled', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, toolbarElement } = result.current;

			// Mock the error.
			vi.spyOn( editor!, 'focus' ).mockImplementation( async () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
				} );
			} );

			await turnOffErrors( async () => {
				editor!.focus();
			} );

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
			expect( editableElements.length ).to.equal( 3 );
		} );

		it( 'should update the editor data when the state has been changed', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!.data, 'set' );

			act( () => {
				setData( { ...rootsContent, 'intro': 'New data' } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.intro ).to.equal( '<p>New data</p>' );
				expect( data.content ).to.equal( rootsContent.content );
				expect( data.footer ).to.equal( rootsContent.footer );
				expect( spy.mock.calls[ 0 ][ 0 ] ).to.deep.equal( { 'intro': 'New data' } );
				expect( editableElements.length ).to.equal( 3 );
				expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
				expect( editor!.getFullData().content ).to.equal( rootsContent.content );
				expect( editor!.getFullData().footer ).to.equal( rootsContent.footer );
			} );
		} );

		it( 'should update only editor roots which content have been changed', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!.data, 'set' );

			act( () => {
				setData( { ...rootsContent, 'intro': '<h2>Sample</h2>', 'footer': 'Text...' } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.intro ).to.equal( '<h2>Sample</h2>' );
				expect( data.footer ).to.equal( '<p>Text...</p>' );
				expect( spy.mock.calls[ 0 ][ 0 ] ).to.deep.equal( { 'intro': '<h2>Sample</h2>', 'footer': 'Text...' } );
				expect( editableElements.length ).to.equal( 3 );
				expect( editor!.getFullData().intro ).to.equal( '<h2>Sample</h2>' );
				expect( editor!.getFullData().footer ).to.equal( '<p>Text...</p>' );
			} );
		} );

		it( 'should not update editor roots when no content have been changed', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!.data, 'set' );

			act( () => {
				setData( { ...rootsContent, 'intro': '<h2>Sample</h2><p>This is an instance of the.</p>' } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy.mock.calls.length ).to.equal( 0 );
				expect( data ).to.deep.equal( rootsContent );
				expect( editableElements.length ).to.equal( 3 );
				expect( editor!.getFullData() ).to.deep.equal( rootsContent );
			} );
		} );

		it( 'should remove the editor root when the key has been removed from the state', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor, setData } = result.current;
			const spy = vi.spyOn( editor!, 'detachRoot' );

			const newData: Record<string, any> = { ...rootsContent };
			delete newData.intro;

			act( () => {
				setData( { ...newData } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( spy ).toHaveBeenCalledOnce();
				expect( data.intro ).to.be.undefined;
				expect( editableElements.length ).to.equal( 2 );
				expect( editor!.getFullData().intro ).to.be.undefined;
			} );
		} );

		it( 'should add the editor root when the key has been added to the state', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

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
				expect( editableElements.length ).to.equal( 4 );
				expect( editor!.getFullData().outro ).to.be.equal( '<p>New data</p>' );
			} );
		} );

		it( 'should update the state when editor root value has been updated', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			act( () => {
				editor!.data.set( { ...rootsContent, 'intro': 'New data' } );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( data.intro ).to.equal( '<p>New data</p>' );
				expect( editableElements.length ).to.equal( 3 );
				expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
			} );
		} );

		it( 'should update the state when editor#addRoot is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

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
			expect( editableElements.length ).to.equal( 4 );
			expect( editor!.getFullData().outro ).to.equal( '' );
		} );

		it( 'should handle newly added roots by _externalSetData', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const editor = result.current.editor!;

			act( () => {
				result.current.setAttributes( {
					...rootsAttributes,
					outro: {
						order: 10,
						row: Date.now()
					}
				} );

				result.current.setData( {
					...rootsContent,
					outro: ''
				} );
			} );

			await waitFor( () => {
				expect( editor.model.document.getRoot( 'outro' ) ).not.toBeNull();
			} );
		} );

		it( 'should update the state when editor#detachRoot is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			expect( result.current.editableElements.length ).to.equal( 3 );

			act( () => {
				editor!.detachRoot( 'intro' );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( data.intro ).to.be.undefined;
				expect( editableElements.length ).to.equal( 2 );
				expect( editor!.getFullData().intro ).to.be.undefined;
			} );
		} );

		it( 'should not throw error when data keys do not match attributes', async () => {
			const originalOnError = window.onerror;
			const stubOnError = vi.fn();

			window.onerror = stubOnError;

			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

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
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.attributes ).to.deep.equal( rootsAttributes );
			} );
		} );

		it( 'should update the editor attributes when setAttributes is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

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
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

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
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			await new Promise<void>( res => {
				act( () => {
					editor!.model.change( writer => {
						editor!.registerRootAttribute( 'foo' );
						writer.clearAttributes( editor!.model.document.getRoot( 'intro' )! );
						writer.setAttributes( { foo: 'bar', order: 1 }, editor!.model.document.getRoot( 'intro' )! );

						res();
					} );
				} );
			} );

			await waitFor( () => {
				const { attributes } = result.current;

				expect( attributes.intro ).to.deep.equal( {
					order: 1,
					row: null,
					foo: 'bar'
				} );
			} );
		} );

		it( 'should throw error when attributes keys do not match data', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { setAttributes } = result.current;

			const newRootsAttributes: Record<string, any> = { ...rootsAttributes };
			delete newRootsAttributes.intro;

			await turnOffErrors( () => {
				act( () => {
					setAttributes( { ...newRootsAttributes } );
				} );
			} );

			expect( console.error ).toHaveBeenCalledWith( '`data` and `attributes` objects must have the same keys (roots).' );
		} );
	} );

	describe( 'callbacks', () => {
		it( 'should call onReady callback when editor has been initialized', async () => {
			const spy = vi.fn();
			const { result } = renderHook( () => useMultiRootEditor( {
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

			renderHook( () => useMultiRootEditor( {
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
			const { result } = renderHook( () => useMultiRootEditor( {
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
			const { result } = renderHook( () => useMultiRootEditor( {
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
			const { result } = renderHook( () => useMultiRootEditor( {
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

		it( 'should call onReady if editor is ready when watchdog is enabled', async () => {
			const onReadyMock = vi.fn();
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onReady: onReadyMock
			} ) );

			await waitFor( () => {
				expect( onReadyMock ).toHaveBeenCalledOnce();
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );

		it( 'should call onAfterDestroy when watchdog restarted editor', async () => {
			const onAfterDestroyMock = vi.fn();
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onAfterDestroy: onAfterDestroyMock
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			// Mock the error.
			await turnOffErrors( async () => {
				const { editor } = result.current;

				vi.spyOn( editor!, 'focus' ).mockImplementation( async () => {
					setTimeout( () => {
						throw new CKEditorError( 'a-custom-error', editor );
					} );
				} );

				editor!.focus();
			} );

			await waitFor( () => {
				expect( onAfterDestroyMock ).toHaveBeenCalledOnce();
			} );
		} );

		it( 'should use console error instead of onError if callback is not passed and watchdog is enabled', async () => {
			const error = new Error( 'Error was thrown.' );

			vi.spyOn( TestMultiRootEditor, 'create' ).mockRejectedValue( error );

			renderHook( () => useMultiRootEditor( {
				...editorProps,
				onError: undefined
			} ) );

			await waitFor( () => {
				expect( console.error ).toHaveBeenCalledWith( error, { phase: 'initialization', willEditorRestart: false } );
			} );
		} );
	} );

	describe( 'disableTwoWayDataBinding set to `true`', () => {
		it( 'should not update the `data` state when editor root value has been updated', async () => {
			const { result } = renderHook( () => useMultiRootEditor( {
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
			expect( editableElements.length ).to.equal( 3 );
			expect( editor!.getFullData().intro ).to.equal( '<p>New data</p>' );
			expect( getDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not update the `data` state when editor#addRoot is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( {
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
			expect( editableElements.length ).to.equal( 4 );
			expect( editor!.getFullData().outro ).to.equal( '' );
		} );

		it( 'should not update the `data` state when editor#detachRoot is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			expect( result.current.editableElements.length ).to.equal( 3 );

			act( () => {
				editor!.detachRoot( 'intro' );
			} );

			await waitFor( () => {
				const { data, editableElements } = result.current;

				expect( data.intro ).to.be.equal( rootsContent.intro );
				expect( editableElements.length ).to.equal( 2 );
				expect( editor!.getFullData().intro ).to.be.undefined;
			} );
		} );

		it( 'should not update the `attributes` state when editor API is called', async () => {
			const { result } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableTwoWayDataBinding: true
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const { editor } = result.current;

			await new Promise<void>( res => {
				act( () => {
					editor!.model.change( writer => {
						editor!.registerRootAttribute( 'foo' );
						writer.clearAttributes( editor!.model.document.getRoot( 'intro' )! );
						writer.setAttributes( { foo: 'bar', order: 1 }, editor!.model.document.getRoot( 'intro' )! );

						res();
					} );
				} );
			} );

			await waitFor( () => {
				const { attributes } = result.current;

				expect( editor!.getRootAttributes( 'intro' ) ).to.deep.equal( {
					order: 1,
					row: null,
					foo: 'bar'
				} );
				expect( attributes.intro ).to.be.deep.equal( rootsAttributes.intro );
			} );
		} );

		it( 'should call `onChange` callback when editor API is called', async () => {
			const config = {
				...editorProps,
				onChange() {}
			};

			const spy = vi.spyOn( config, 'onChange' );

			const { result } = renderHook( () => useMultiRootEditor( config ) );

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
			it.skip( 'should assign `data` property to the editor even if it is still mounting', { retry: 4 }, async () => {
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

				const { result } = renderHook( () => useMultiRootEditor( {
					...editorProps,
					disableWatchdog: !enableWatchdog,
					editor: SlowEditor
				} ) );

				await timeout( 500 );

				// Depending on the execution order on the event loop, this `setData` might be delayed by the React engine.
				// It happens only if the event loop is busy and React has to wait for the next tick a little bit longer than usual.
				// It does not play well with the `waitFor` below, so we added a few retries to make it more stable.
				// It should not be a problem in real life, as it is a rare case and might be solved in future React versions.
				result.current.setData( {
					intro: 'Hello World!',
					content: ''
				} );

				await timeout( 500 );

				await deferInitialization.resolve();

				await waitFor( () => {
					expect( result.current.editor ).to.be.instanceof( SlowEditor );
					expect( result.current.editor!.data.get() ).to.deep.equal( {
						intro: 'Hello World!',
						content: ''
					} );
				} );
			} );

			it( 'should buffer many rerenders while creating multiroot editor', async () => {
				const initializerLog: Array<any> = [];

				class SlowEditor extends TestMultiRootEditor {
					public declare key: any;

					constructor( initialData, config ) {
						super( initialData, config );
						this.key = config.key;
					}

					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						const editor = new SlowEditor( ...args );

						await editor.initPlugins();
						await timeout( 300 );

						editor.ui.init();
						editor.fire( 'ready' );

						return editor;
					}
				}

				const { rerender } = renderHook( ( newProps: any ) => useMultiRootEditor( {
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

	describe( 'unmount', () => {
		it( 'should not crash when the multiroot editor is unmounted without assigning any editable to any root', async () => {
			const { result, unmount } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true,
				semaphoreElement: document.createElement( 'div' )
			} ) );

			await waitFor( () => {
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );

			const editor = result.current.editor!;
			const { ui, model, editing } = editor;

			const root = model.document.getRoot( 'intro' );

			if ( root && ui.getEditableElement( 'intro' ) ) {
				editor.detachEditable( root );
			}

			const editable = ui.view.createEditable( 'intro', document.createElement( 'div' ) );
			ui.addEditable( editable );

			editing.view.domRoots.delete( 'intro' );

			expect( () => {
				unmount();
			} ).not.to.throw();
		} );

		it( 'should not crash when the multiroot hook editable is unmounted after removal of root', async () => {
			const renderedEditor: { current: TestMultiRootEditor | null } = { current: null };

			const Component = ( { renderEditables = true }: { renderEditables?: boolean } ) => {
				const { editableElements, toolbarElement, editor } = useMultiRootEditor( {
					...editorProps,
					disableWatchdog: true
				} );

				useEffect( () => {
					if ( editor ) {
						renderedEditor.current = editor;
					}
				}, [ editor ] );

				return (
					<>
						{toolbarElement}
						{renderEditables && editableElements}
					</>
				);
			};

			const { container, rerender } = render( <Component /> );

			await waitFor( () => {
				expect( renderedEditor.current ).not.to.be.null;
				expect( container.getElementsByClassName( 'ck-editor__editable' ).length ).to.equal( 3 );
			} );

			renderedEditor.current!.model.document.roots.remove( 'intro' );
			rerender( <Component renderEditables={false} /> );

			await waitFor( () => {
				expect( container.getElementsByClassName( 'ck-editor__editable' ).length ).to.equal( 0 );
			} );
		} );
	} );

	describe( 'context integration', () => {
		it( 'should use the editor from the context', async () => {
			const contextWatchdog = await createTestMultiRootWatchdog();

			const { result } = renderHook( () => useMultiRootEditor( editorProps ), {
				wrapper: ( { children } ) => (
					<ContextWatchdogContext.Provider
						value={{
							status: 'initialized',
							watchdog: contextWatchdog
						}}
					>
						{ children }
					</ContextWatchdogContext.Provider>
				)
			} );

			await waitFor( () => {
				expect( contextWatchdog.context?.editors.has( result.current.editor! ) ).to.be.true;
				expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
			} );
		} );

		it( 'should not use the editor from the context when watchdog is not initialized', async () => {
			const { result } = renderHook( () => useMultiRootEditor( editorProps ), {
				wrapper: ( { children } ) => (
					<ContextWatchdogContext.Provider
						value={{
							status: 'initializing'
						}}
					>
						{ children }
					</ContextWatchdogContext.Provider>
				)
			} );

			// Let's wait a bit to check if nothing happens.
			await timeout( 200 );
			await waitFor( () => {
				expect( result.current.editor ).to.be.null;
			} );
		} );
	} );

	describe( 'EditorEditable', () => {
		it( 'should render editable containers returned from `useMultiRootEditor` with proper class names', async () => {
			const Component = () => {
				const { editableElements, toolbarElement } = useMultiRootEditor( {
					...editorProps,
					disableWatchdog: true
				} );

				return (
					<>
						{editableElements}
						{toolbarElement}
					</>
				);
			};

			const { container } = render( <Component /> );

			await waitFor( () => {
				expect( container.getElementsByClassName( 'ck-editor__editable' ).length ).to.equal( 3 );
			} );
		} );

		it( 'should ensure that the editable container is rendered before running semaphore logic', async () => {
			const defer = createDefer();
			const postMountSpy = vi.fn();

			const mockSemaphore = {
				revision: 1,
				runAfterMount: callback => {
					defer.promise
						.then( () => callback( { instance: null } ) )
						.then( postMountSpy );
				}
			} as any;

			const { unmount } = render(
				<EditorEditable
					rootName="intro"
					id="intro"
					semaphore={mockSemaphore}
				/>
			);

			unmount();
			defer.resolve();

			await waitFor( () => {
				expect( postMountSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'EditorToolbarWrapper', () => {
		it( 'should remove the toolbar element when the editor is unmounted', async () => {
			const { editor, toolbarElement } = createMockEditorWithToolbar();
			const { unmount } = render(
				<EditorToolbarWrapper editor={editor} />
			);

			expect( unmount ).not.to.throw();
			expect( toolbarElement.parentElement ).to.be.null;
		} );

		it( 'should not crash when editor unmounted toolbar container element before react', () => {
			const { editor, toolbarElement } = createMockEditorWithToolbar();
			const { unmount } = render(
				<EditorToolbarWrapper editor={editor} />
			);

			toolbarElement.remove();
			expect( unmount ).not.to.throw();
		} );

		function createMockEditorWithToolbar() {
			const toolbarElement = document.createElement( 'div' );
			const mockEditor: any = {
				ui: {
					view: {
						toolbar: {
							element: toolbarElement
						}
					}
				}
			};

			return {
				toolbarElement,
				editor: mockEditor
			};
		}
	} );
} );
