/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, beforeEach, it, expect } from 'vitest';
import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import useMultiRootEditor from '../../src/useMultiRootEditor.js';
import { TestMultiRootEditor } from '../_utils/multirooteditor.js';

const AppUsingHooks = props => {
	const {
		editableElements, toolbarElement
	} = useMultiRootEditor( props );

	return (
		<div>
			<div data-testid="toolbar">{ toolbarElement }</div>
			<div data-testid="roots">{ editableElements }</div>
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
		component = render( <AppUsingHooks { ...editorProps } /> );

		expect( component.getByTestId( 'toolbar' ).children ).to.have.length( 1 );
		expect( component.getByTestId( 'roots' ).children ).to.have.length( 2 );
	} );
} );
