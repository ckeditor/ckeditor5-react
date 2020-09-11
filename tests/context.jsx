/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Context from '../src/context.jsx';
import CKEditor from '../src/ckeditor.jsx';
import EditorMock from './_utils/editor.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

configure( { adapter: new Adapter() } );

class CKEditorContextMock {
	static create( config ) {
		return Promise.resolve( new CKEditorContextMock( config ) );
	}
	static destroy() {
		return Promise.resolve();
	}
}

describe( 'CKEditor Context Component', () => {
	let wrapper;

	afterEach( () => {
		sinon.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'initialization', () => {
		it( 'should create an instance of the ContextWatchdog', async () => {
			wrapper = mount( <Context context={ CKEditorContextMock } /> );

			const component = wrapper.instance();

			expect( component.contextWatchdog ).to.be.an( 'object' );
			expect( component.contextWatchdog ).to.be.instanceOf( ContextWatchdog );
		} );

		it( 'should render its children', async () => {
			wrapper = mount(
				<Context context={ CKEditorContextMock } >
					<div></div>
					<p>Foo</p>
				</Context>
			);

			expect( wrapper.childAt( 0 ).name() ).to.equal( 'div' );
			expect( wrapper.childAt( 1 ).name() ).to.equal( 'p' );
		} );

		it( 'should pass the context watchdog to inner editor components', async () => {
			wrapper = mount(
				<Context context={ CKEditorContextMock } >
					<CKEditor editor={ EditorMock }></CKEditor>
				</Context>
			);

			const component = wrapper.instance();

			expect( component.contextWatchdog ).to.be.an( 'object' );
			expect( wrapper.childAt( 0 ).name() ).to.equal( 'CKEditor' );
			expect( wrapper.childAt( 0 ).prop( 'contextWatchdog' ) ).to.be.an( 'object' );
		} );

		it( 'should render the inner editor component', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );

			await new Promise( ( res, rej ) => {
				wrapper = mount(
					<Context context={ CKEditorContextMock } onError={ rej } >
						<CKEditor editor={ EditorMock } onReady={ res } onError={ rej } />
					</Context>
				);
			} );

			const component = wrapper.instance();

			expect( component.contextWatchdog ).to.be.an( 'object' );
			expect( wrapper.childAt( 0 ).name() ).to.equal( 'CKEditor' );
			expect( wrapper.childAt( 0 ).prop( 'contextWatchdog' ) ).to.be.an( 'object' );
			expect( wrapper.childAt( 0 ).prop( 'editor' ) ).to.be.a( 'function' );

			expect( wrapper.childAt( 0 ).instance().editor ).to.be.an( 'object' );

			sinon.assert.calledOnce( editorCreateSpy );

			expect( editorCreateSpy.firstCall.args[ 1 ] ).to.have.property( 'context' );
			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.be.instanceOf( CKEditorContextMock );
		} );

		it( 'should initialize its inner editors correctly', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );

			await new Promise( ( res, rej ) => {
				wrapper = mount(
					<Context context={ CKEditorContextMock } onError={ rej } >
						<CKEditor editor={ EditorMock } config={ { initialData: '<p>Foo</p>' } } />
						<CKEditor editor={ EditorMock } config={ { initialData: '<p>Bar</p>' } } />
					</Context>
				);

				const watchdog = wrapper.instance().contextWatchdog;

				watchdog.on( 'stateChange', () => {
					if ( watchdog.state === 'ready' ) {
						res();
					}
				} );
			} );

			const editor1 = wrapper.childAt( 0 ).instance().editor;
			const editor2 = wrapper.childAt( 1 ).instance().editor;

			expect( editor1 ).to.be.an( 'object' );
			expect( editor2 ).to.be.an( 'object' );

			sinon.assert.calledTwice( editorCreateSpy );

			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.be.instanceOf( CKEditorContextMock );
			expect( editorCreateSpy.secondCall.args[ 1 ].context ).to.be.instanceOf( CKEditorContextMock );
			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.equal( editorCreateSpy.secondCall.args[ 1 ].context );
		} );
	} );

	describe( 'properties', () => {
		describe( '#onError', () => {
			it( 'should be called when an initialization error occurs', async () => {
				const error = new Error();
				sinon.stub( ContextWatchdog.prototype, 'create' ).rejects( error );
				sinon.stub( ContextWatchdog.prototype, 'add' ).resolves();

				const errorEvent = await new Promise( res => {
					wrapper = mount(
						<Context context={ CKEditorContextMock } onError={ res } >
							<CKEditor editor={ EditorMock } />
						</Context>
					);
				} );

				expect( errorEvent ).to.be.an( 'object' );
				expect( errorEvent.error ).to.equal( error );
			} );

			it( 'should be called when a runtime error occurs', async () => {
				let onErrorCallback;
				const onErrorSpy = sinon.spy( onErrorCallback );

				await new Promise( ( res, rej ) => {
					wrapper = mount(
						<Context
							context={ CKEditorContextMock }
							onReady={ res }
							onError={ errorEvt => {
								onErrorSpy( errorEvt );
								rej( errorEvt.error );
							} }
						>
							<CKEditor editor={ EditorMock } />
						</Context >
					);
				} );

				const error = new CKEditorError( 'foo', wrapper.instance().editorContext );

				wrapper.instance().contextWatchdog._fire( 'error', {
					error,
					causesRestart: true
				} );

				sinon.assert.calledOnce( onErrorSpy );
			} );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should handle context error', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );

			await new Promise( ( res, rej ) => {
				wrapper = mount(
					<Context context={ CKEditorContextMock } onError={ rej } >
						<CKEditor editor={ EditorMock } onReady={ res } onError={ rej } />
					</Context>
				);
			} );

			const component = wrapper.instance();

			expect( component.contextWatchdog ).to.be.an( 'object' );
			expect( wrapper.childAt( 0 ).name() ).to.equal( 'CKEditor' );
			expect( wrapper.childAt( 0 ).prop( 'contextWatchdog' ) ).to.be.an( 'object' );
			expect( wrapper.childAt( 0 ).prop( 'editor' ) ).to.be.a( 'function' );

			expect( wrapper.childAt( 0 ).instance().editor ).to.be.an( 'object' );

			sinon.assert.calledOnce( editorCreateSpy );

			expect( editorCreateSpy.firstCall.args[ 1 ] ).to.have.property( 'context' );
			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.be.instanceOf( CKEditorContextMock );
		} );
	} );
} );
