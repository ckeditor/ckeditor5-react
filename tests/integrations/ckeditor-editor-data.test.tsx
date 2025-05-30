/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';

import CKEditor from '../../src/ckeditor.js';

import { TestClassicEditor } from '../_utils/classiceditor.js';

const Editor = props => {
	return (
		<CKEditor editor={ TestClassicEditor } { ...props } />
	);
};

class AppUsingState extends React.Component {
	public declare editor: any;
	public declare props: any;
	public declare state: any;

	constructor( props ) {
		super( props );

		this.state = {
			content: ''
		};

		this.editor = null;
	}

	public render() {
		return (
			<Editor
				data={ this.state.content }
				onChange={ ( _, editor ) => this.setState( { content: editor.getData() } ) }
				onReady={ editor => {
					this.editor = editor;
					this.props.onReady();
				} }
			/>
		);
	}
}

class AppUsingStaticString extends React.Component {
	public declare editor: any;
	public declare props: any;
	public declare state: any;

	constructor( props ) {
		super( props );

		this.state = {
			content: ''
		};

		this.editor = null;
	}

	public render() {
		return (
			<Editor
				data={ '<p>Initial data.</p>' }
				onChange={ ( _, editor ) => this.setState( { content: editor.getData() } ) }
				onReady={ editor => {
					this.editor = editor;
					this.props.onReady();
				} }
			/>
		);
	}
}

describe( 'CKEditor Component - integration', () => {
	describe( 'update the editor\'s content', () => {
		// Common usage of the component - a component's state is passed to the <CKEditor> component.
		describe( '#data is connected with the state', () => {
			let div, component;

			beforeEach( () => {
				div = document.createElement( 'div' );
				document.body.appendChild( div );

				return new Promise( resolve => {
					component = ReactDOM.render( <AppUsingState onReady={ resolve } />, div );
				} );
			} );

			afterEach( () => {
				div.remove();
			} );

			it( 'returns initial state', () => {
				const editor = component.editor;

				expect( editor.getData() ).to.equal( '' );
				expect( component.state.content ).to.equal( '' );
			} );

			it( 'updates the editor\'s content when state has changed', () => {
				component.setState( { content: 'Foo.' } );

				const editor = component.editor;

				// State has been updated because we attached the `onChange` callback.
				expect( component.state.content ).to.equal( '<p>Foo.</p>' );
				expect( editor.getData() ).to.equal( '<p>Foo.</p>' );
			} );

			it( 'updates state when a user typed something', () => {
				const editor = component.editor;

				editor.model.change( writer => {
					writer.insertText( 'Plain text.', editor.model.document.selection.getFirstPosition() );
				} );

				expect( component.state.content ).to.equal( '<p>Plain text.</p>' );
				expect( editor.getData() ).to.equal( '<p>Plain text.</p>' );
			} );
		} );

		// Non-common usage but it shouldn't blow or freeze the editor.
		describe( '#data is a static string', () => {
			let div, component;

			beforeEach( () => {
				div = document.createElement( 'div' );
				document.body.appendChild( div );

				return new Promise( resolve => {
					component = ReactDOM.render( <AppUsingStaticString onReady={ resolve } />, div );
				} );
			} );

			afterEach( () => {
				div.remove();
			} );

			it( 'returns initial state', () => {
				const editor = component.editor;

				expect( component.state.content ).to.equal( '' );
				expect( editor.getData() ).to.equal( '<p>Initial data.</p>' );
			} );

			it( 'updates the editor\'s content when state has changed', () => {
				component.setState( { content: 'Foo.' } );

				const editor = component.editor;

				// The editor's content has not been updated because the component's `[data]` property isn't connected with it.
				expect( editor.getData() ).to.equal( '<p>Initial data.</p>' );
				expect( component.state.content ).to.equal( 'Foo.' );
			} );

			it( 'updates state when a user typed something', () => {
				const editor = component.editor;

				editor.model.change( writer => {
					writer.insertText( 'Plain text. ', editor.model.document.selection.getFirstPosition() );
				} );

				expect( component.state.content ).to.equal( '<p>Plain text. Initial data.</p>' );
				expect( editor.getData() ).to.equal( '<p>Plain text. Initial data.</p>' );
			} );
		} );
	} );
} );
