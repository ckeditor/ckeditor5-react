/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */

import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CKEditor from '../../src/ckeditor.jsx';
import CKEditorContext from '../../src/ckeditorcontext.jsx';

const { Context } = window.CKEditor5.core;

class CustomContext extends Context {}

configure( { adapter: new Adapter() } );

class App extends React.Component {
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

	componentDidMount() {
		// When the layout is ready you can switch the state and render the `<CKEditor />` component.
		this.setState( { isLayoutReady: true } );
	}

	render() {
		return (
			<div className="row row-editor">
				{ /* Do not render the <CKEditor /> component before the layout is ready. */ }
				{ this.state.isLayoutReady && (
					<CKEditorContext
						config={ {} }
						context={ CustomContext }
					>
						<CKEditor
							onReady={ () => {
								this.props.onReady();
							} }
							onChange={ ( event, editor ) => console.log( { event, editor } ) }
							editor={ window.ClassicEditor }
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
	let div;

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return new Promise( resolve => {
			ReactDOM.render( <App onReady={ resolve }/>, div );
		} );
	} );

	afterEach( () => {
		div.remove();
	} );

	// Watchdog and Context features are asynchronous. They reject a promise instead of throwing an error.
	// React does not handle async errors. Hence, we add a custom error handler for unhandled rejections.
	it( 'should not crash when destroying an editor with the context feature', async () => {
		// Create a stub to describe exact assertions.
		const handlerStub = sinon.stub();

		// Save a callback to a variable to remove the listener at the end.
		const errorHandler = evt => {
			return handlerStub( evt.reason.message );
		};

		window.addEventListener( 'unhandledrejection', errorHandler );

		ReactDOM.unmountComponentAtNode( div );

		// Does not work with `0`.
		await wait( 1 );

		window.removeEventListener( 'unhandledrejection', errorHandler );

		sinon.assert.neverCalledWith( handlerStub, 'Cannot read properties of undefined (reading \'then\')' );
		sinon.assert.neverCalledWith( handlerStub, 'Cannot read properties of null (reading \'model\')' );
	} );
} );

function wait( ms ) {
	return new Promise( resolve => {
		setTimeout( resolve, ms );
	} );
}
