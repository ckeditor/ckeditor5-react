/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global MultiRootEditor, window */

import React from 'react';
import { renderHook } from '@testing-library/react-hooks/dom';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import useMultiRootEditor from '../src/useMultiRootEditor.tsx';

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

	describe( 'editor', () => {
		it( 'should initialize the MultiRootEditor instance after mounting', async () => {
			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			expect( result.current.editor ).to.be.null;

			await waitForNextUpdate();

			expect( result.current.editor ).to.be.instanceof( MultiRootEditor );
		} );

		it( 'should reinitialize the editor instance after crashing when watchdog is enabled', async () => {
			const originalErrorHandler = window.onerror;
			const originalConsoleError = console.error;
			window.onerror = sinon.spy();
			console.error = sinon.spy();

			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor, content, attributes } = result.current;

			// Mock the error.
			sinon.stub( editor, 'focus' ).callsFake( () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
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

			window.onerror = originalErrorHandler;
			console.error = originalConsoleError;
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
			const originalErrorHandler = window.onerror;
			const originalConsoleError = console.error;
			window.onerror = sinon.spy();
			console.error = sinon.spy();

			const { result, waitForNextUpdate } = renderHook( () => useMultiRootEditor( editorProps ) );

			await waitForNextUpdate();

			const { editor, toolbarElement } = result.current;

			// Mock the error.
			sinon.stub( editor, 'focus' ).callsFake( () => {
				setTimeout( () => {
					throw new CKEditorError( 'a-custom-error', editor );
				} );
			} );

			// Throw the error.
			editor.focus();

			await waitForNextUpdate();

			const { toolbarElement: newToolbarElement } = result.current;

			expect( newToolbarElement ).to.be.exist;
			expect( newToolbarElement ).to.not.be.equal( toolbarElement );

			window.onerror = originalErrorHandler;
			console.error = originalConsoleError;
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
		it( 'should call onReady callback when editor has been initialized', () => {

		} );

		it( 'should call onError callback when an error has been thrown', () => {

		} );

		it( 'should call onChange callback when the editor has been updated', () => {

		} );

		it( 'should call onFocus callback when the editor has been focused', () => {

		} );

		it( 'should call onBlur callback when the editor has been blurred', () => {

		} );
	} );
} );
