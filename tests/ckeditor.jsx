/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global HTMLDivElement */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Editor from './_utils/editor';
import CKEditor from '../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component', () => {
	let wrapper;

	beforeEach( () => {
		sinon.stub( Editor._model.document, 'on' );
		sinon.stub( Editor._editing.view.document, 'on' );
	} );

	afterEach( () => {
		sinon.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'initialization', () => {
		it( 'calls "Editor#create()" with default configuration if not specified', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onInit={ res } /> );
			} );

			expect( Editor.create.calledOnce ).to.be.true;
			expect( Editor.create.firstCall.args[ 0 ] ).to.be.an.instanceof( HTMLDivElement );
			expect( Editor.create.firstCall.args[ 1 ] ).to.have.property( 'initialData', '' );
		} );

		it( 'passes configuration object directly to the "Editor#create()" method', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			function myPlugin() { }

			const editorConfig = {
				plugins: [
					myPlugin
				],
				toolbar: {
					items: [ 'bold' ]
				}
			};

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } config={ editorConfig } onInit={ res } /> );
			} );

			expect( Editor.create.calledOnce ).to.be.true;
			expect( Editor.create.firstCall.args[ 1 ] ).to.deep.equal( {
				plugins: [
					myPlugin
				],
				toolbar: {
					items: [ 'bold' ]
				},
				initialData: '',
				context: undefined
			} );
		} );

		it( 'sets initial data if was specified (using the "data" property)', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } data="<p>Hello CKEditor 5!</p>" onInit={ res } /> );
			} );

			expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'sets initial data if was specified (using the "config" property with the `initialData` key)', done => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			wrapper = mount( <CKEditor editor={ Editor } config={ {
				initialData: '<p>Hello CKEditor 5!</p>'
			} } /> );

			setTimeout( () => {
				expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
					'<p>Hello CKEditor 5!</p>'
				);

				done();
			} );
		} );

		it( 'shows a warning if used "data" and "config.initialData" at the same time', done => {
			const consoleWarnStub = sinon.stub( console, 'warn' );

			wrapper = mount( <CKEditor editor={ Editor } data="<p>Foo</p>" config={ {
				initialData: '<p>Bar</p>'
			} } /> );

			setTimeout( () => {
				// We must restore "console.warn" before assertions in order to see warnings if they were logged.
				consoleWarnStub.restore();

				expect( consoleWarnStub.calledOnce ).to.be.true;
				expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal(
					'Editor data should be provided either using `config.initialData` or `data` properties. ' +
					'The config property is over the data value and the first one will be used when specified both.'
				);

				done();
			} );
		} );

		it( 'uses "config.initialData" over "data" when specified both', done => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			wrapper = mount( <CKEditor editor={ Editor } data="<p>Foo</p>" config={ {
				initialData: '<p>Bar</p>'
			} } /> );

			setTimeout( () => {
				// We must restore "console.warn" before assertions in order to see warnings if they were logged.
				consoleWarnStub.restore();

				expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
					'<p>Bar</p>'
				);

				done();
			} );
		} );

		it( 'when setting initial data, it must not use "Editor.setData()"', done => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );
			sinon.stub( editorInstance, 'setData' );

			wrapper = mount( <CKEditor editor={ Editor } data="<p>Hello CKEditor 5!</p>" /> );

			setTimeout( () => {
				expect( editorInstance.setData.called ).to.be.false;

				done();
			} );
		} );

		it( 'must not update the component by React itself', done => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			setTimeout( () => {
				const component = wrapper.instance();

				// This method always is called with an object with component's properties.
				expect( component.shouldComponentUpdate( {} ) ).to.equal( false );

				done();
			} );
		} );

		it( 'displays an error if something went wrong and "onError" callback was not specified', done => {
			const error = new Error( 'Something went wrong.' );
			const consoleErrorStub = sinon.stub( console, 'error' );

			sinon.stub( Editor, 'create' ).rejects( error );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			setTimeout( () => {
				// We must restore "console.error" before assertions in order to see errors if something really went wrong.
				consoleErrorStub.restore();

				expect( consoleErrorStub.calledOnce ).to.be.true;
				expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );

				done();
			} );
		} );
	} );

	describe( 'properties', () => {
		// See: #83.
		it( 'does not update anything if component is not ready', () => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			const component = wrapper.instance();
			let shouldComponentUpdate;

			expect( () => {
				shouldComponentUpdate = component.shouldComponentUpdate( { disabled: true } );
			} ).to.not.throw();

			expect( shouldComponentUpdate ).to.be.false;
		} );

		describe( '#onInit', () => {
			it( 'calls "onInit" callback if specified when the editor is ready to use', async () => {
				const editorInstance = new Editor();
				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				const onInitArgument = await new Promise( resolve => {
					wrapper = mount( <CKEditor editor={ Editor } onInit={ resolve } /> );
				} );

				expect( onInitArgument ).to.equal( editorInstance );
			} );
		} );

		describe( '#onChange', () => {
			it( 'executes "onChange" callback if it was specified and the editor\'s data has changed', async () => {
				const onChange = sinon.spy();
				const editorInstance = new Editor();
				const modelDocument = Editor._model.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onChange={ onChange }
						onInit={ res }
						onError={ rej } /> );
				} );

				const fireChanges = modelDocument.on.firstCall.args[ 1 ];
				const event = { name: 'change:data' };

				fireChanges( event );

				expect( onChange.calledOnce ).to.equal( true );
				expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
				expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onChange" callback if it is available in runtime when the editor\'s data has changed', async () => {
				const onChange = sinon.spy();
				const editorInstance = new Editor();
				const modelDocument = Editor._model.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onInit={ res }
						onError={ rej } /> );
				} );

				wrapper.setProps( { onChange } );

				const fireChanges = modelDocument.on.firstCall.args[ 1 ];
				const event = { name: 'change:data' };

				fireChanges( event );

				expect( onChange.calledOnce ).to.equal( true );
				expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
				expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onFocus', () => {
			it( 'listens to the "viewDocument#focus" event in order to call "onFocus" callback', done => {
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );
				sinon.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {
					// More events are being attached to `viewDocument`.
					expect( viewDocument.on.calledTwice ).to.be.true;
					expect( viewDocument.on.firstCall.args[ 0 ] ).to.equal( 'focus' );
					expect( viewDocument.on.firstCall.args[ 1 ] ).to.be.a( 'function' );

					done();
				} );
			} );

			it( 'executes "onFocus" callback if it was specified and the editor was focused', done => {
				const onFocus = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } onFocus={ onFocus } /> );

				setTimeout( () => {
					const fireChanges = viewDocument.on.firstCall.args[ 1 ];
					const event = { name: 'focus' };

					fireChanges( event );

					expect( onFocus.calledOnce ).to.equal( true );
					expect( onFocus.firstCall.args[ 0 ] ).to.equal( event );
					expect( onFocus.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );

			it( 'executes "onFocus" callback if it is available in runtime when the editor was focused', done => {
				const onFocus = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {
					wrapper.setProps( { onFocus } );

					const fireChanges = viewDocument.on.firstCall.args[ 1 ];
					const event = { name: 'focus' };

					fireChanges( event );

					expect( onFocus.calledOnce ).to.equal( true );
					expect( onFocus.firstCall.args[ 0 ] ).to.equal( event );
					expect( onFocus.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );
		} );

		describe( '#onBlur', () => {
			it( 'listens to the "viewDocument#blur" event in order to call "onBlur" callback', done => {
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );
				sinon.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {
					// More events are being attached to `viewDocument`.
					expect( viewDocument.on.calledTwice ).to.be.true;
					expect( viewDocument.on.secondCall.args[ 0 ] ).to.equal( 'blur' );
					expect( viewDocument.on.secondCall.args[ 1 ] ).to.be.a( 'function' );

					done();
				} );
			} );

			it( 'executes "onBlur" callback if it was specified and the editor was blurred', done => {
				const onBlur = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } onBlur={ onBlur } /> );

				setTimeout( () => {
					const fireChanges = viewDocument.on.secondCall.args[ 1 ];
					const event = { name: 'blur' };

					fireChanges( event );

					expect( onBlur.calledOnce ).to.equal( true );
					expect( onBlur.firstCall.args[ 0 ] ).to.equal( event );
					expect( onBlur.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );

			it( 'executes "onBlur" callback if it is available in runtime when the editor was blurred', done => {
				const onBlur = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {
					wrapper.setProps( { onBlur } );

					const fireChanges = viewDocument.on.secondCall.args[ 1 ];
					const event = { name: 'blur' };

					fireChanges( event );

					expect( onBlur.calledOnce ).to.equal( true );
					expect( onBlur.firstCall.args[ 0 ] ).to.equal( event );
					expect( onBlur.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );
		} );

		describe( '#onError', () => {
			it( 'calls the callback if specified when an error occurs', done => {
				const error = new Error( 'Error was thrown.' );
				const errorHandler = sinon.spy();

				sinon.stub( Editor, 'create' ).rejects( error );
				wrapper = mount( <CKEditor editor={ Editor } onError={ errorHandler } /> );

				setTimeout( () => {
					expect( errorHandler.calledOnce ).to.equal( true );

					expect( errorHandler.firstCall.args[ 0 ] ).to.equal( error );
					done();
				} );
			} );
		} );

		describe( '#disabled', () => {
			it( 'switches the editor to read-only mode if [disabled={true}]', done => {
				const onInit = function( editor ) {
					expect( editor.isReadOnly ).to.be.true;

					done();
				};

				wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onInit={ onInit } /> );
			} );

			it( 'switches the editor to read-only mode when [disabled={true}] property was set in runtime', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onInit={ res }
						onError={ rej } /> );
				} );

				wrapper.setProps( { disabled: true } );

				expect( wrapper.instance().editor.isReadOnly ).to.be.true;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'calls "Editor#destroy()" method during unmounting the component', async () => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );

			await new Promise( ( res, rej ) => {
				wrapper = mount( <CKEditor
					editor={ Editor }
					onInit={ res }
					onError={ rej } /> );
			} );

			await new Promise( res => {
				sinon.stub( editorInstance, 'destroy' ).callsFake( () => {
					res();

					return Promise.resolve();
				} );

				wrapper.unmount();
			} );

			wrapper = null;

			expect( editorInstance.destroy.calledOnce ).to.be.true;
		} );

		it( 'should set to "null" the "editor" property inside the component', async () => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );
			sinon.stub( editorInstance, 'destroy' ).resolves();

			await new Promise( ( res, rej ) => {
				wrapper = mount( <CKEditor
					editor={ Editor }
					onInit={ res }
					onError={ rej } /> );
			} );

			const component = wrapper.instance();

			expect( component.editor ).is.not.null;

			wrapper.unmount();
			wrapper = null;

			// Wait a cycle.
			await new Promise( res => setTimeout( res ) );

			expect( component.editor ).is.null;
		} );
	} );
} );
