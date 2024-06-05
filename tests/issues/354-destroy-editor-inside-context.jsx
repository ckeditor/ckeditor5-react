/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { Context, ContextWatchdog } from 'ckeditor5';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../../src/ckeditor.tsx';
import CKEditorContext from '../../src/ckeditorcontext.tsx';

import { waitFor } from '../_utils/waitFor.js';
import { TestClassicEditor } from '../_utils/classiceditor.js';

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
						contextWatchdog={ ContextWatchdog }
					>
						{ this.state.renderEditor && (
							<CKEditor
								onReady={ () => this.props.onReady() }
								onChange={ ( event, editor ) => console.log( { event, editor } ) }
								editor={ TestClassicEditor }
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

		await waitFor( () => {
			expect( wrapper.find( CKEditor ).exists() ).to.equal( false );
			expect( wrapper.find( App ).getDOMNode().querySelector( '.ck-editor' ) ).to.equal( null );
		} );
	} );
} );
