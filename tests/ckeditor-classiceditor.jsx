/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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
} );
