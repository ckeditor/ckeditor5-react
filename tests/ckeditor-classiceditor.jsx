/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import 'react-dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../dist/ckeditor';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component + ClassicEditor Build', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	it( 'should initialize the ClassicEditor properly', done => {
		wrapper = mount( <CKEditor editor={ ClassicEditor } /> );

		setTimeout( () => {
			const component = wrapper.instance();

			expect( component.editor ).to.not.be.null;
			expect( component.editor.element ).to.not.be.null;

			done();
		} );
	} );

	describe( 'customize the element where the editable is enabled', () => {
		it( 'allows specifying a name of the element', done => {
			wrapper = mount( <CKEditor editor={ ClassicEditor } tagName="textarea" /> );

			setTimeout( () => {
				const component = wrapper.instance();

				expect( component.editor.sourceElement ).to.be.instanceOf( HTMLTextAreaElement );

				done();
			} );
		} );

		it( 'allows specifying classes of the element', done => {
			wrapper = mount( <CKEditor editor={ ClassicEditor } class="foo-1 foo-2" /> );

			setTimeout( () => {
				const component = wrapper.instance();
				const sourceElement = component.editor.sourceElement;

				expect( sourceElement.classList.contains( 'foo-1' ) ).to.be.true;
				expect( sourceElement.classList.contains( 'foo-2' ) ).to.be.true;

				done();
			} );
		} );

		it( 'allows specifying styles of the element', done => {
			wrapper = mount( <CKEditor editor={ ClassicEditor } style={ { fontFamily: 'Arial', color: '#ff0' } } /> );

			setTimeout( () => {
				const component = wrapper.instance();
				const sourceElement = component.editor.sourceElement;

				// Two attrs come from the test case, the third one appears during the editor's initialization.
				expect( sourceElement.style.length ).to.equal( 3 );

				done();
			} );
		} );
	} );
} );
