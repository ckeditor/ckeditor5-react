/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global MultiRootEditor */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';

import useMultiRootEditor from '../../src/useMultiRootEditor.tsx';

configure( { adapter: new Adapter() } );

const AppUsingHooks = props => {
	const {
		editableElements, toolbarElement
	} = useMultiRootEditor( props );

	return (
		<div>
			<div id="toolbar">{ toolbarElement }</div>
			<div id="roots">{ editableElements }</div>
		</div>
	);
};

describe( 'useMultiRootEditor Hook + MultiRootEditor Build', () => {
	let wrapper;

	const data = {
		intro: '<h2>Sample</h2><p>This is an instance of the.</p>',
		content: '<p>It is the custom content</p>'
	};

	const rootsAttributes = {
		intro: {
			row: '1',
			order: 10
		},
		content: {
			row: '1',
			order: 20
		}
	};

	const editorProps = {
		editor: MultiRootEditor,
		data,
		rootsAttributes,
		config: {
			rootsAttributes
		}
	};

	it( 'should initialize the MultiRootEditor properly', async () => {
		await act( async () => {
			wrapper = mount( <AppUsingHooks { ...editorProps } /> );
		} );

		expect( wrapper.exists() ).to.be.true;
		expect( wrapper.find( '#toolbar' ).instance().childElementCount ).to.be.equal( 1 );
		expect( wrapper.find( '#roots' ).instance().childElementCount ).to.be.equal( 2 );
	} );
} );
