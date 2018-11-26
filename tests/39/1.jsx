import React from 'react';
import ReactDOM from 'react-dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CKEditor from '../../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

const Editor = ( props ) => {
	return (
		<CKEditor editor={ ClassicEditor } {...props} />
	)
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
				onChange={ (evt, editor) => this.setState( { content: editor.getData() } ) }
				onInit={ _editor => this.editor = _editor }
			/>
		)
	}
}

describe( '#37 - a browser is being freeze', () => {
	let div, component;

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return new Promise( resolve => {
			component = ReactDOM.render( <App />, div );

			setTimeout( resolve );
		} );
	} );

	afterEach( () => {
		div.remove();
	} );

	it( 'if "data" property is not specified, a browser should not be a frozen', () => {
		const editor = component.editor;

		editor.model.change( writer => {
			writer.insertText( 'Plain text', editor.model.document.selection.getFirstPosition() );
		} );

		expect( editor.getData() ).to.equal( '<p>Plain text</p>' );
		expect( component.state.content ).to.equal( '<p>Plain text</p>' );
	} );
} );
