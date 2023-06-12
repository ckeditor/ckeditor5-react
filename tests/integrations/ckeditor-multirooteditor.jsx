/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global MultiRootEditor, document */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import CKEditor from '../../src/ckeditor.tsx';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component + MultiRootEditor Build', () => {
	let wrapper;
	const data = { content: '<h1>Test</h1>' };
	const sourceElements = {};

	beforeEach( () => {
		const div = document.createElement( 'div' );
		document.body.appendChild( div );

		sourceElements.content = div;
	} );

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	it( 'should initialize the MultiRootEditor properly', async () => {
		await new Promise( res => {
			wrapper = mount( <CKEditor
				editor={ MultiRootEditor }
				sourceElements={ sourceElements }
				data={ data }
				onReady={ res }
			/> );
		} );

		const component = wrapper.instance();

		expect( component.editor ).to.not.be.null;
		expect( component.editor.element ).to.not.be.null;
	} );
} );
