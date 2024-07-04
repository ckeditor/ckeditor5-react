/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { Context, ContextWatchdog } from 'ckeditor5';
import { render } from '@testing-library/react';
import CKEditor from '../../src/ckeditor.tsx';
import CKEditorContext from '../../src/ckeditorcontext.tsx';
import { TestClassicEditor } from '../_utils/classiceditor.js';
import { PromiseManager } from '../_utils/render.tsx';

class CustomContext extends Context {}

class App extends React.Component {
	public declare props: any;
	public declare editor: any;
	public declare state: any;

	constructor( props: { onReady: Function } ) {
		super( props );

		this.state = {
			isLayoutReady: false,
			renderEditor: true
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
	it( 'should destroy the editor within a context', async () => {
		const manager = new PromiseManager();

		const wrapper = render( <App onReady={ manager.resolveOnRun() } /> );

		await manager.all();

		wrapper.find( App ).setState( { renderEditor: false } );

		expect( wrapper.find( CKEditor ).exists() ).to.equal( false );
		expect( wrapper.queryAllByRole( 'application' ) ).to.equal( null );

		wrapper.unmount();
	} );
} );
