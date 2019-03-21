/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Editor from  './_utils/editor';
import CKEditor from '../src/ckeditor.jsx';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component', () => {
	let sandbox, wrapper;

	beforeEach( () => {
		sandbox = sinon.createSandbox();

		sandbox.stub( Editor._model.document, 'on' );
		sandbox.stub( Editor._editing.view.document, 'on' );
	} );

	afterEach( () => {
		sandbox.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'initialization', () => {
		it( 'calls "Editor#create()" with default configuration if not specified', () => {
			sandbox.stub( Editor, 'create' ).resolves( new Editor() );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			expect( Editor.create.calledOnce ).to.be.true;
			expect( Editor.create.firstCall.args[ 0 ] ).to.be.an.instanceof( HTMLDivElement );
			expect( Editor.create.firstCall.args[ 1 ] ).to.deep.equal( {} );
		} );

		it( 'passes configuration object directly to the "Editor#create()" method', () => {
			sandbox.stub( Editor, 'create' ).resolves( new Editor() );

			const editorConfig = {
				plugins: [
					function myPlugin() {}
				],
				toolbar: {
					items: [ 'bold' ]
				}
			};

			wrapper = mount( <CKEditor editor={ Editor } config={ editorConfig } /> );

			expect( Editor.create.calledOnce ).to.be.true;
			expect( Editor.create.firstCall.args[ 1 ] ).to.deep.equal( editorConfig );
		} );

		it( 'sets initial data if was specified', done => {
			sandbox.stub( Editor, 'create' ).resolves( new Editor() );

			wrapper = mount( <CKEditor editor={ Editor } data="<p>Hello CKEditor 5!</p>" /> );

			setTimeout( () => {
				const component = wrapper.instance();

				expect( component.domContainer.current.innerHTML ).to.equal( '<p>Hello CKEditor 5!</p>' );

				done();
			} );
		} );

		it( 'when setting initial data, it must not use "Editor.setData()"', done => {
			const editorInstance = new Editor();

			sandbox.stub( Editor, 'create' ).resolves( editorInstance );
			sandbox.stub( editorInstance, 'setData' );

			wrapper = mount( <CKEditor editor={ Editor } data="<p>Hello CKEditor 5!</p>" /> );

			setTimeout( () => {
				expect( editorInstance.setData.called ).to.be.false;

				done();
			} );
		} );

		it( 'displays an error if something went wrong', done => {
			const error = new Error( 'Something went wrong.' );
			const consoleErrorStub = sandbox.stub( console, 'error' );

			sandbox.stub( Editor, 'create' ).rejects( error );

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
		it( 'does not update the editor\'s data if value under "data" key is equal to editor\'s data', done => {
			const editorInstance = new Editor();

			sandbox.stub( Editor, 'create' ).resolves( editorInstance );
			sandbox.stub( editorInstance, 'setData' );
			sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo Bar.</p>' );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			setTimeout( () => {
				wrapper.setProps( { data: '<p>Foo Bar.</p>' });

				expect( editorInstance.setData.calledOnce ).to.be.false;

				done();
			} );
		} );

		it( 'does not set editor\'s data if the editor is not ready', () => {
			const editorInstance = new Editor();

			sandbox.stub( Editor, 'create' ).resolves( editorInstance );
			sandbox.stub( editorInstance, 'setData' );

			wrapper = mount( <CKEditor editor={ Editor } /> );

			const component = wrapper.instance();

			component.componentDidUpdate( { data: 'Foo' } );

			expect( component.editor ).to.be.null;
			expect( editorInstance.setData.called ).to.be.false;
		} );

		describe( '#config', () => {
			it( 'should replace all react DOM references with the `current` DOM element', done => {
				const spy = sinon.spy( Editor, 'create' );

				const domElement = document.createElement( 'div' );
				const domElementRef = React.createRef();
				const similarToDomElementRef = {
					current: domElement,
					foo: 'bar'
				};

				const config = {
					domElement,
					domElementRef,
					nested: {
						domElementRef
					},
					similarToDomElementRef,
					array: [
						domElementRef, domElement, similarToDomElementRef
					]
				};

				wrapper = mount(
					<div>
						<div ref={ domElementRef }></div>
						<CKEditor editor={ Editor } config={ config } />
					</div>
				);

				setTimeout( () => {
					const parsedConfig = spy.lastCall.args[ 1 ];

					// Not changed.
					expect( parsedConfig.domElement ).to.equal( domElement ).to.instanceof( HTMLElement );

					// Changed.
					expect( parsedConfig.domElementRef ).to.equal( domElementRef.current ).to.instanceof( HTMLElement );

					// Changed.
					expect( parsedConfig.nested.domElementRef ).to.equal( domElementRef.current ).to.instanceof( HTMLElement );

					// Not changed.
					expect( parsedConfig.similarToDomElementRef ).to.deep.equal( similarToDomElementRef );
					expect( parsedConfig.similarToDomElementRef.current ).to.equal( domElement );

					// Changed.
					expect( parsedConfig.array[ 0 ] ).to.equal( domElementRef.current ).to.instanceof( HTMLElement );

					// Not changed.
					expect( parsedConfig.array[ 1 ] ).to.equal( domElement );
					expect( parsedConfig.array[ 2 ] ).to.deep.equal( similarToDomElementRef );
					expect( parsedConfig.array[ 2 ].current ).to.equal( domElement );

					spy.restore();
					done();
				} );
			} );
		} );

		describe( '#onInit', () => {
			it( 'calls "onInit" callback if specified when the editor is ready to use', done => {
				const editorInstance = new Editor();
				const onInit = sandbox.spy();

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } onInit={ onInit } /> );

				setTimeout( () => {
					expect( onInit.calledOnce ).to.be.true;
					expect( onInit.firstCall.args[ 0 ] ).to.equal( editorInstance );

					done();
				} );
			} );
		} );

		describe( '#onChange', () => {
			it( 'listens to the editor\'s changes in order to call "onChange" callback', done => {
				const editorInstance = new Editor();
				const modelDocument = Editor._model.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );
				sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {

					expect( modelDocument.on.calledOnce ).to.be.true;
					expect( modelDocument.on.firstCall.args[ 0 ] ).to.equal( 'change:data' );
					expect( modelDocument.on.firstCall.args[ 1 ] ).to.be.a( 'function' );

					done();
				} );
			} );

			it( 'executes "onChange" callback if it was specified and the editor\'s data has changed', done => {
				const onChange = sandbox.spy();
				const editorInstance = new Editor();
				const modelDocument = Editor._model.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } onChange={ onChange } /> );

				setTimeout( () => {
					const fireChanges = modelDocument.on.firstCall.args[ 1 ];
					const event = { name: 'change:data' };

					fireChanges( event );

					expect( onChange.calledOnce ).to.equal( true );
					expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
					expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );

			it( 'executes "onChange" callback if it is available in runtime when the editor\'s data has changed', done => {
				const onChange = sandbox.spy();
				const editorInstance = new Editor();
				const modelDocument = Editor._model.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

				wrapper = mount( <CKEditor editor={ Editor } /> );

				setTimeout( () => {
					wrapper.setProps( { onChange } );

					const fireChanges = modelDocument.on.firstCall.args[ 1 ];
					const event = { name: 'change:data' };

					fireChanges( event );

					expect( onChange.calledOnce ).to.equal( true );
					expect( onChange.firstCall.args[ 0 ] ).to.equal( event );
					expect( onChange.firstCall.args[ 1 ] ).to.equal( editorInstance );

					done();
				} );
			} );
		} );

		describe( '#onFocus', () => {
			it( 'listens to the "viewDocument#focus" event in order to call "onFocus" callback', done => {
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );
				sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

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
				const onFocus = sandbox.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

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
				const onFocus = sandbox.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

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

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );
				sandbox.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

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
				const onBlur = sandbox.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

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
				const onBlur = sandbox.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sandbox.stub( Editor, 'create' ).resolves( editorInstance );

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

		describe( '#disabled', () => {
			it( 'switches the editor to read-only mode if [disabled={true}]', done => {
				const onInit = function( editor ) {
					expect( editor.isReadOnly ).to.be.true;

					done();
				};

				wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onInit={ onInit } /> );
			} );

			it( 'switches the editor to read-only mode when [disabled={true}] property was set in runtime', done => {
				let editor;

				const onInit = function( _editor ) {
					editor = _editor;
				};

				wrapper = mount( <CKEditor editor={ Editor } onInit={ onInit } /> );

				setTimeout( () => {
					wrapper.setProps( { disabled: true } );

					expect( editor.isReadOnly ).to.be.true;

					done();
				} );
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'calls "Editor#destroy()" method during unmounting the component', done => {
			const editorInstance = new Editor();

			sandbox.stub( Editor, 'create' ).resolves( editorInstance );
			sandbox.stub( editorInstance, 'destroy' ).resolves();

			wrapper = mount( <CKEditor editor={ Editor } /> );

			setTimeout( () => {
				wrapper.unmount();
				wrapper = null;

				expect( editorInstance.destroy.calledOnce ).to.be.true;

				done();
			} );
		} );

		it( 'should set to "null" the "editor" property inside the component', done => {
			const editorInstance = new Editor();

			sandbox.stub( Editor, 'create' ).resolves( editorInstance );
			sandbox.stub( editorInstance, 'destroy' ).resolves();

			wrapper = mount( <CKEditor editor={ Editor } /> );

			setTimeout( () => {
				const component = wrapper.instance();

				expect( component.editor ).is.not.null;

				wrapper.unmount();
				wrapper = null;

				setTimeout( () => {
					expect( component.editor ).is.null;

					done();
				} );
			} );
		} );
	} );
} );
