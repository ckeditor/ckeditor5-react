/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global MultiRootEditor */

import React from 'react';
import { renderHook } from '@testing-library/react-hooks/dom';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import useMultiRootEditor from '../src/useMultiRootEditor.tsx';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching';

describe( 'useMultiRootEditor', () => {
	const content = {
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
		editor: MultiRootEditor,
		content,
		rootsAttributes,
		config: {
			rootsAttributes
		}
	};

	let originalConsoleError;

	beforeEach( () => {
		originalConsoleError = console.error;

		console.error = sinon.stub();
	} );

	afterEach( () => {
		console.error = originalConsoleError;

		sinon.restore();
	} );

	describe( 'editor', () => {
		it( 'should initialize the MultiRootEditor instance after mounting', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			expect( result.current.editor ).to.be.null;

			await waitForNextUpdate();

			expect( result.current.editor ).to.be.instanceof( MultiRootEditor );
		} );

		it( 'should reinitialize the editor instance after crashing when watchdog is enabled', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor, content, attributes } = result.current;

			// Mock the error.
			sinon.stub( editor, 'focus' ).callsFake( async () => {
				await turnOffDefaultErrorCatching( () => {
					return new Promise( () => {
						setTimeout( () => {
							throw new CKEditorError( 'a-custom-error', editor );
						} );
					} );
				} );
			} );

			// Throw the error.
			editor.focus();

			await waitForNextUpdate();

			const { editor: newEditor, content: newContent, attributes: newAttributes } = result.current;

			expect( newEditor ).to.be.exist;
			expect( newEditor.id ).to.not.be.equal( editor.id );
			expect( newContent ).to.deep.equal( content );
			expect( newAttributes ).to.deep.equal( attributes );
		} );

		it( 'should not initialize the editor when config#isLayoutReady flag is false', async () => {
			const { result, waitForNextUpdate, rerender } = renderHook( isLayoutReady => useMultiRootEditor( {
				...editorProps,
				isLayoutReady
			} ), { initialProps: false } );

			await waitForNextUpdate().catch( () => {
				expect( result.current.editor ).to.be.null;
			} );

			rerender( true );

			await waitForNextUpdate();

			expect( result.current.editor ).to.be.exist;
		} );

		it( 'should initialize the MultiRootEditor instance when watchdog is disabled', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				disableWatchdog: true
			} ) );

			await waitForNextUpdate();

			expect( result.current.editor ).to.be.instanceof( MultiRootEditor );
		} );
	} );

	describe( 'toolbarElement', () => {
		it( 'should be instance of React element', async () => {
			const { result: { current: { toolbarElement } } } = renderHook( () => useMultiRootEditor( editorProps ) );

			expect( React.isValidElement( toolbarElement ) ).to.be.true;
			expect( toolbarElement.type ).to.be.equal( 'div' );
		} );

		it( 'should be reinitialized after crashing when watchdog is enabled', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor, toolbarElement } = result.current;

			// Mock the error.
			sinon.stub( editor, 'focus' ).callsFake( async () => {
				await turnOffDefaultErrorCatching( () => {
					return new Promise( () => {
						setTimeout( () => {
							throw new CKEditorError( 'a-custom-error', editor );
						} );
					} );
				} );
			} );

			// Throw the error.
			editor.focus();

			await waitForNextUpdate();

			const { toolbarElement: newToolbarElement } = result.current;

			expect( newToolbarElement ).to.be.exist;
			expect( newToolbarElement ).to.not.be.equal( toolbarElement );
		} );
	} );

	describe( 'content and editableElements', () => {
		it( 'should return the initial state', () => {

		} );

		it( 'should update the editor attributes when the state has been changed', () => {

		} );

		it( 'should remove the editor root when the key has been removed from the state', () => {

		} );

		it( 'should add the editor root when the key has been added to the state', () => {

		} );

		it( 'should update the state when editor root value has been updated', () => {

		} );

		it( 'should update the state when editor#addRoot is called', () => {

		} );

		it( 'should update the state when editor#detachRoot is called', () => {

		} );
	} );

	describe( 'attributes', () => {
		it( 'should return the initial state', () => {

		} );

		it( 'should update the editor attributes when setAttributes is called', () => {

		} );

		it( 'should update the state when editor API is called', () => {

		} );
	} );

	describe( 'callbacks', () => {
		it( 'should call onReady callback when editor has been initialized', async () => {
			const spy = sinon.spy();
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onReady: spy
			} ) );

			await waitForNextUpdate();

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, result.current.editor );
		} );

		it( 'should call onError callback when an error has been thrown', async () => {
			const error = new Error( 'Error was thrown.' );

			sinon.stub( MultiRootEditor, 'create' ).rejects( error );

			const spy = sinon.spy();
			const { waitFor } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onError: spy
			} ) );

			await waitFor( () => sinon.assert.calledOnce( spy ) );

			sinon.assert.calledWith( spy, error, { phase: 'initialization', willEditorRestart: false } );

			sinon.restore();
		} );

		it( 'should call onChange callback when the editor has been updated', async () => {
			const spy = sinon.spy();
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onChange: spy
			} ) );

			await waitForNextUpdate();

			const { editor, content } = result.current;

			content.intro = 'new Data';
			editor.setData( { ...content } );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, editor );
		} );

		it( 'should call onFocus callback when the editor has been focused', async () => {
			const spy = sinon.spy();
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onFocus: spy
			} ) );

			await waitForNextUpdate();

			const { editor } = result.current;

			editor.editing.view.document.fire( 'focus' );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, editor );
		} );

		it( 'should call onBlur callback when the editor has been blurred', async () => {
			const spy = sinon.spy();
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( {
				...editorProps,
				onBlur: spy
			} ) );

			await waitForNextUpdate();

			const { editor } = result.current;

			editor.editing.view.document.fire( 'blur', { target: {} } );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, editor );
		} );
	} );
} );
