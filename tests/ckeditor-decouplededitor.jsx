/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import CKEditor from '../dist/ckeditor';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component + DecoupledEditor Build', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	it( 'should initialize the DecoupledEditor properly', done => {
		wrapper = mount( <CKEditor editor={ DecoupledEditor } onInit={ editor => {
			// Inserts the toolbar before the editable area.
			editor.ui.view.editable.element.parentElement.insertBefore(
				editor.ui.view.toolbar.element,
				editor.ui.view.editable.element
			);
		} } /> );

		setTimeout( () => {
			const component = wrapper.instance();

			expect( component.editor ).to.not.be.null;
			expect( component.editor.ui.view.toolbar.element.nextElementSibling ).to.equal( component.editor.ui.view.editable.element );

			done();
		} );
	} );
} );
