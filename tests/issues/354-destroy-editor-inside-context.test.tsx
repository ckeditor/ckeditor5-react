/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { Context, ContextWatchdog } from 'ckeditor5';
import { render, waitFor } from '@testing-library/react';
import CKEditor from '../../src/ckeditor.js';
import CKEditorContext from '../../src/context/ckeditorcontext.js';
import { TestClassicEditor } from '../_utils/classiceditor.js';
import { PromiseManager } from '../_utils/promisemanager.js';

class CustomContext extends Context {}

class App extends React.Component {
	public declare props: any;
	public declare editor: any;
	public declare state: any;

	constructor( props: { onReady: Function; renderEditor?: boolean } ) {
		super( props );

		this.state = {
			isLayoutReady: false
		};

		this.editor = null;
	}

	public componentDidMount() {
		this.setState( { isLayoutReady: true } );
	}

	public render() {
		return (
			<div className="row row-editor">
				{ this.state.isLayoutReady && (
					<CKEditorContext
						config={ {} }
						context={ CustomContext }
						contextWatchdog={ ContextWatchdog }
					>
						{ this.props.renderEditor && (
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
	it( 'should destroy the editor within a context', async () => {
		const manager = new PromiseManager();
		const wrapper = render( <App onReady={ manager.resolveOnRun() } renderEditor /> );

		await manager.all();
		await waitFor( () => {
			expect( wrapper.queryByText( 'Rich Text Editor' ) ).not.to.be.null;
		} );

		wrapper.rerender(
			<App onReady={ manager.resolveOnRun() } renderEditor={false} />
		);

		await waitFor( () => {
			expect( wrapper.queryByText( 'Rich Text Editor' ) ).to.be.null;
		} );

		wrapper.unmount();
	} );
} );
