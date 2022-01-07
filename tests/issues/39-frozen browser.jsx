/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, ClassicEditor */

import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

const Editor = props => {
	return (
		<CKEditor editor={ ClassicEditor } { ...props } />
	);
};

class App extends React.Component {
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
				onChange={ ( evt, editor ) => this.setState( { content: editor.getData() } ) }
				onReady={ editor => {
					this.editor = editor;
					this.props.onReady();
				} }
			/>
		);
	}
}

describe( 'issue #37: the browser is being frozen', () => {
	let div, component;

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return new Promise( resolve => {
			component = ReactDOM.render( <App onReady={ resolve } />, div ); // eslint-disable-line react/no-render-return-value
		} );
	} );

	afterEach( () => {
		div.remove();
	} );

	it( 'if the "#data" property is not specified, the browser should not freeze', () => {
		const editor = component.editor;

		editor.model.change( writer => {
			writer.insertText( 'Plain text', editor.model.document.selection.getFirstPosition() );
		} );

		expect( editor.getData() ).to.equal( '<p>Plain text</p>' );
		expect( component.state.content ).to.equal( '<p>Plain text</p>' );
	} );
} );
