/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CKEditor from '../../src/ckeditor.tsx';
import CKEditorContext from '../../src/ckeditorcontext.tsx';

const { Context } = window.CKEditor5.core;

class CustomContext extends Context {}

configure( { adapter: new Adapter() } );

class App extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isLayoutReady: false,
			renderEditor: true
		};

		this.editor = null;
	}

	componentDidMount() {
		this.setState( { isLayoutReady: true } );
	}

	render() {
		return (
			<div className="row row-editor">
				{ this.state.isLayoutReady && (
					<CKEditorContext
						config={ {} }
						context={ CustomContext }
					>
						{ this.state.renderEditor && (
							<CKEditor
								onReady={ () => this.props.onReady() }
								onChange={ ( event, editor ) => console.log( { event, editor } ) }
								editor={ window.ClassicEditor }
								config={ {} }
								data={ '<p>Paragraph</p>' }
							/>
						) }
					</CKEditorContext>
				) }
			</div>
		);
	}
}

describe( 'issue #354: unable to destroy the editor within a context', () => {
	let wrapper;

	beforeEach( () => {
		return new Promise( resolve => {
			wrapper = mount( <App onReady={ resolve }/> );
		} );
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	it( 'should destroy the editor within a context', async () => {
		wrapper.find( App ).setState( { renderEditor: false } );

		await wait( 0 );

		expect( wrapper.find( CKEditor ).exists() ).to.equal( false );
		expect( wrapper.find( App ).getDOMNode().querySelector( '.ck-editor' ) ).to.equal( null );
	} );
} );

function wait( ms ) {
	return new Promise( resolve => {
		setTimeout( resolve, ms );
	} );
}
