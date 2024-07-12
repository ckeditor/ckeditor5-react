/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */

import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Context, ContextWatchdog } from 'ckeditor5';

import CKEditor from '../../src/ckeditor.tsx';
import CKEditorContext from '../../src/ckeditorcontext.tsx';

import { TestClassicEditor } from '../_utils/classiceditor.js';

class CustomContext extends Context {}

class App extends React.Component {
	public declare editor: any;
	public declare state: any;
	public declare props: any;
	public declare sidebarElementRef: React.RefObject<HTMLDivElement>;

	constructor( props ) {
		super( props );

		this.state = {
			// You need this state to render the <CKEditor /> component after the layout is ready.
			// <CKEditor /> needs HTMLElements of `Sidebar` and `PresenceList` plugins provided through
			// the `config` property and you have to ensure that both are already rendered.
			isLayoutReady: false
		};

		this.editor = null;
		this.sidebarElementRef = React.createRef();
	}

	public componentDidMount() {
		// When the layout is ready you can switch the state and render the `<CKEditor />` component.
		this.setState( { isLayoutReady: true } );
	}

	public render() {
		return (
			<div className="row row-editor">
				{ /* Do not render the <CKEditor /> component before the layout is ready. */ }
				{ this.state.isLayoutReady && (
					<CKEditorContext
						config={ {} }
						contextWatchdog={ ContextWatchdog }
						context={ CustomContext }
					>
						<CKEditor
							onReady={ () => {
								this.props.onReady();
							} }
							onChange={ ( event, editor ) => console.log( { event, editor } ) }
							editor={ TestClassicEditor }
							config={ {} }
							data={ '<p>Paragraph</p>' }
						/>
					</CKEditorContext>
				) }
				<div ref={ this.sidebarElementRef } className="sidebar"></div>
			</div>
		);
	}
}

describe( 'issue #349: crash when destroying an editor with the context', () => {
	let div: HTMLElement, root;

	beforeEach( () => {
		div = document.createElement( 'div' );
		root = createRoot( div );
		document.body.appendChild( div );

		return new Promise( resolve => {
			root.render( <App onReady={ resolve }/> );
		} );
	} );

	afterEach( () => {
		div.remove();
	} );

	// Watchdog and Context features are asynchronous. They reject a promise instead of throwing an error.
	// React does not handle async errors. Hence, we add a custom error handler for unhandled rejections.
	it( 'should not crash when destroying an editor with the context feature', async () => {
		// Create a stub to describe exact assertions.
		const handlerStub = vi.fn();

		// Save a callback to a variable to remove the listener at the end.
		const errorHandler = evt => {
			return handlerStub( evt.reason.message );
		};

		window.addEventListener( 'unhandledrejection', errorHandler );

		root.unmount();

		// Does not work with `0`.
		await wait( 1 );

		window.removeEventListener( 'unhandledrejection', errorHandler );

		expect( handlerStub ).not.toHaveBeenCalledWith( 'Cannot read properties of undefined (reading \'then\')' );
		expect( handlerStub ).not.toHaveBeenCalledWith( 'Cannot read properties of null (reading \'model\')' );
	} );
} );

function wait( ms: number ) {
	return new Promise( resolve => {
		setTimeout( resolve, ms );
	} );
}
