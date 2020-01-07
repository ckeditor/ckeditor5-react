/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

const Editor = ( props ) => {
	return (
		<CKEditor editor={ ClassicEditor } { ...props } />
	)
};

class AppUsingState extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			content: ''
		};

		this.editor = null;
	}

	render() {
		return (
			<Editor
				data={ this.state.content }
				onChange={ (evt, editor) => this.setState( { content: editor.getData() } ) }
				onInit={ _editor => this.editor = _editor }
			/>
		)
	}
}

class AppUsingStaticString extends AppUsingState {
	render() {
		return (
			<Editor
				data={ '<p>Initial data.</p>' }
				onChange={ (evt, editor) => this.setState( { content: editor.getData() } ) }
				onInit={ _editor => this.editor = _editor }
			/>
		)
	}
}

describe( 'CKEditor Component - integration', () => {
	describe('update the editor\'s content', () => {
		// Common usage of the component - a component's state is passed to the <CKEditor> component.
		describe( '#data is connected with the state', () => {
			let div, component;

			beforeEach( () => {
				div = document.createElement( 'div' );
				document.body.appendChild( div );

				return new Promise( resolve => {
					component = ReactDOM.render( <AppUsingState />, div );

					setTimeout( resolve );
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
					component = ReactDOM.render( <AppUsingStaticString />, div );

					setTimeout( resolve );
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
