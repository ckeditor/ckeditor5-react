/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, beforeEach, it, expect } from 'vitest';
import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useMultiRootEditor from '../../src/useMultiRootEditor.tsx';
import { TestMultiRootEditor } from '../_utils/multirooteditor.js';

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
	let component: RenderResult | null = null;

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
		editor: TestMultiRootEditor,
		data,
		rootsAttributes,
		config: {
			rootsAttributes
		}
	};

	beforeEach( () => {
		component?.unmount();
	} );

	it( 'should initialize the MultiRootEditor properly', async () => {
		await act( async () => {
			component = render( <AppUsingHooks { ...editorProps } /> );
		} );

		expect( component.exists() ).to.be.true;
		expect( component.find( '#toolbar' ).instance().childElementCount ).to.be.equal( 1 );
		expect( component.find( '#roots' ).instance().childElementCount ).to.be.equal( 2 );
	} );
} );
