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

class App extends React.Component {
	public declare editor: any;
	public declare props: any;

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
				onChange={ ( _, editor ) => this.setState( { content: editor.getData() } ) }
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
			component = ReactDOM.render( <App onReady={ resolve } />, div );
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
