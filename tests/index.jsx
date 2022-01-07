/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import ContextMock from './_utils/context.js';
import Editor from './_utils/editor';
import { CKEditor, CKEditorContext } from '../dist/ckeditor';

configure( { adapter: new Adapter() } );

describe( 'index.js', () => {
	describe( 'the <CKEditor> component', () => {
		let wrapper;

		afterEach( () => {
			if ( wrapper ) {
				wrapper.unmount();
			}
		} );

		it( 'should be the CKEditor Component', async () => {
			expect( CKEditor ).to.be.a( 'function' );

			const editor = await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onReady={ res } /> );
			} );

			expect( editor ).to.be.instanceOf( Editor );
		} );
	} );

	describe( 'the <CKEditorContext> component', () => {
		let wrapper;

		afterEach( () => {
			if ( wrapper ) {
				wrapper.unmount();
			}
		} );

		it( 'should be the CKEditorContext Component', async () => {
			expect( CKEditorContext ).to.be.a( 'function' );

			const context = await new Promise( res => {
				wrapper = mount( <CKEditorContext context={ ContextMock } onReady={ res } /> );
			} );

			expect( context ).to.be.instanceOf( ContextMock );
		} );
	} );
} );
