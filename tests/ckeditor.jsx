/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, HTMLDivElement, document */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Editor from './_utils/editor';
import CKEditor from '../src/ckeditor.tsx';
import { CKEditorError } from 'ckeditor5';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';
import { waitFor } from './_utils/waitFor.js';
import { createDefer } from './_utils/defer.js';
import { timeout } from './_utils/timeout.js';

configure( { adapter: new Adapter() } );

describe( '<CKEditor> Component', () => {
	let wrapper, CKEDITOR_VERSION;

	beforeEach( () => {
		CKEDITOR_VERSION = window.CKEDITOR_VERSION;

		wrapper = null;
		window.CKEDITOR_VERSION = '42.0.0';
		sinon.stub( Editor._model.document, 'on' );
		sinon.stub( Editor._editing.view.document, 'on' );
	} );

	afterEach( () => {
		sinon.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}

		window.CKEDITOR_VERSION = CKEDITOR_VERSION;
	} );

	describe( 'initialization', () => {
		it( 'should print a warning if the "window.CKEDITOR_VERSION" variable is not available', done => {
			delete window.CKEDITOR_VERSION;
			const warnStub = sinon.stub( console, 'warn' );

			const onReady = () => {
				expect( warnStub.callCount ).to.equal( 1 );
				expect( warnStub.firstCall.args[ 0 ] ).to.equal( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
				done();
			};

			wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onReady={ onReady }/> );
		} );

		it( 'should print a warning if using CKEditor 5 in version lower than 37', done => {
			window.CKEDITOR_VERSION = '36.0.0';
			const warnStub = sinon.stub( console, 'warn' );

			const onReady = () => {
				expect( warnStub.callCount ).to.equal( 1 );
				expect( warnStub.firstCall.args[ 0 ] ).to.equal(
					'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.'
				);
				done();
			};

			wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onReady={ onReady }/> );
		} );

		it( 'should not print any warninig if using CKEditor 5 in version 37 or higher', done => {
			window.CKEDITOR_VERSION = '42.0.0';
			const warnStub = sinon.stub( console, 'warn' );

			const onReady = () => {
				expect( warnStub.callCount ).to.equal( 0 );
				done();
			};

			wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onReady={ onReady }/> );
		} );

		it( 'calls "Editor#create()" with default configuration if not specified', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
			} );

			expect( Editor.create.calledOnce ).to.be.true;
			expect( Editor.create.firstCall.args[ 0 ] ).to.be.an.instanceof( HTMLDivElement );
			expect( Editor.create.firstCall.args[ 1 ] ).to.have.property( 'initialData', '' );
		} );

		it( 'passes configuration object directly to the "Editor#create()" method', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			function myPlugin() {}

			const editorConfig = {
				plugins: [
					myPlugin
				],
				toolbar: {
					items: [ 'bold' ]
				}
			};

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } config={ editorConfig } onReady={ res }/> );
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
				wrapper = mount( <CKEditor editor={ Editor } data="<p>Hello CKEditor 5!</p>" onReady={ res }/> );
			} );

			expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'sets initial data if was specified (using the "config" property with the `initialData` key)', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } config={ { initialData: '<p>Hello CKEditor 5!</p>' } } onReady={ res }/> );
			} );

			expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'shows a warning if used "data" and "config.initialData" at the same time', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );

			await new Promise( res => {
				const data = '<p>Foo</p>';

				wrapper = mount( <CKEditor editor={ Editor } data={ data } config={ { initialData: data } } onReady={ res }/> );
			} );

			// We must restore "console.warn" before assertions in order to see warnings if they were logged.
			consoleWarnStub.restore();

			expect( consoleWarnStub.calledOnce ).to.be.true;
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.equal(
				'Editor data should be provided either using `config.initialData` or `content` property. ' +
				'The config value takes precedence over `content` property and will be used when both are specified.'
			);
		} );

		it( 'uses "config.initialData" over "data" when specified both', async () => {
			const consoleWarnStub = sinon.stub( console, 'warn' );
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } data="<p>Foo</p>" config={ {
					initialData: '<p>Bar</p>'
				} } onReady={ res }/> );
			} );

			// We must restore "console.warn" before assertions in order to see warnings if they were logged.
			consoleWarnStub.restore();

			expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal(
				'<p>Bar</p>'
			);
		} );

		it( 'when setting initial data, it must not use "Editor.setData()"', async () => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );
			sinon.stub( editorInstance, 'setData' );

			await new Promise( res => {
				wrapper = mount( <CKEditor
					editor={ Editor }
					data="<p>Hello CKEditor 5!</p>"
					onReady={ res }/> );
			} );

			expect( editorInstance.setData.called ).to.be.false;
		} );

		it( 'must not update the component by React itself', async () => {
			sinon.stub( Editor, 'create' ).resolves( new Editor() );

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
			} );

			const component = wrapper.instance();

			// This method always is called with an object with component's properties.
			expect( component.shouldComponentUpdate( {} ) ).to.equal( false );
		} );

		it( 'displays an error if something went wrong and "onError" callback was not specified', async () => {
			const error = new Error( 'Something went wrong.' );
			const consoleErrorStub = sinon.stub( console, 'error' ).callsFake( () => {
			} );

			sinon.stub( Editor, 'create' ).rejects( error );

			wrapper = mount( <CKEditor editor={ Editor }/> );

			await new Promise( res => setTimeout( res ) );

			// We must restore "console.error" before assertions in order to see warnings if they were logged.
			consoleErrorStub.restore();

			expect( consoleErrorStub.calledOnce ).to.be.true;
			expect( consoleErrorStub.firstCall.args[ 0 ] ).to.equal( error );
			expect( consoleErrorStub.firstCall.args[ 1 ].phase ).to.equal( 'initialization' );
			expect( consoleErrorStub.firstCall.args[ 1 ].willEditorRestart ).to.equal( false );
		} );

		it( 'passes the specified editor class to the watchdog feature', async () => {
			const EditorWatchdog = CKEditor._EditorWatchdog;
			const constructorSpy = sinon.spy();

			class CustomEditorWatchdog extends EditorWatchdog {
				constructor( ...args ) {
					super( ...args );
					constructorSpy( ...args );
				}
			}

			CKEditor._EditorWatchdog = CustomEditorWatchdog;

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
			} );

			expect( constructorSpy.called ).to.equal( true );
			expect( constructorSpy.firstCall.args[ 0 ] ).to.equal( Editor );

			CKEditor._EditorWatchdog = EditorWatchdog;
		} );

		it( 'passes the watchdog config to the watchdog feature', async () => {
			const EditorWatchdog = CKEditor._EditorWatchdog;
			const constructorSpy = sinon.spy();
			const myWatchdogConfig = { crashNumberLimit: 678 };

			class CustomEditorWatchdog extends EditorWatchdog {
				constructor( ...args ) {
					super( ...args );
					constructorSpy( ...args );
				}
			}

			CKEditor._EditorWatchdog = CustomEditorWatchdog;

			await new Promise( res => {
				wrapper = mount( <CKEditor editor={ Editor } onReady={ res } watchdogConfig={ myWatchdogConfig }/> );
			} );

			expect( constructorSpy.called ).to.equal( true );
			expect( constructorSpy.firstCall.args[ 1 ] ).to.deep.equal( myWatchdogConfig );

			CKEditor._EditorWatchdog = EditorWatchdog;
		} );
	} );

	describe( 'properties', () => {
		// See: #83.
		it( 'does not update anything if component is not ready', async () => {
			const editorInstance = new Editor();

			sinon.stub( Editor, 'create' ).resolves( editorInstance );

			wrapper = mount( <CKEditor editor={ Editor }/> );

			const component = wrapper.instance();
			let shouldComponentUpdate;

			expect( () => {
				shouldComponentUpdate = component.shouldComponentUpdate( { disabled: true } );
			} ).to.not.throw();

			expect( shouldComponentUpdate ).to.be.false;
		} );

		describe( '#onReady', () => {
			it( 'calls "onReady" callback if specified when the editor is ready to use', async () => {
				const editorInstance = new Editor();
				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				const editor = await new Promise( resolve => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ resolve }/> );
				} );

				expect( editor ).to.equal( editorInstance );
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
						onReady={ res }
						onError={ rej }/> );
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
						onReady={ res }
						onError={ rej }/> );
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
			it( 'listens to the "viewDocument#focus" event in order to call "onFocus" callback', async () => {
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );
				sinon.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
				} );

				// More events are being attached to `viewDocument`.
				expect( viewDocument.on.calledTwice ).to.be.true;
				expect( viewDocument.on.firstCall.args[ 0 ] ).to.equal( 'focus' );
				expect( viewDocument.on.firstCall.args[ 1 ] ).to.be.a( 'function' );
			} );

			it( 'executes "onFocus" callback if it was specified and the editor was focused', async () => {
				const onFocus = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onFocus={ onFocus } onReady={ res }/> );
				} );

				const fireChanges = viewDocument.on.firstCall.args[ 1 ];
				const event = { name: 'focus' };

				fireChanges( event );

				expect( onFocus.calledOnce ).to.equal( true );
				expect( onFocus.firstCall.args[ 0 ] ).to.equal( event );
				expect( onFocus.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onFocus" callback if it is available in runtime when the editor was focused', async () => {
				const onFocus = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
				} );

				wrapper.setProps( { onFocus } );

				const fireChanges = viewDocument.on.firstCall.args[ 1 ];
				const event = { name: 'focus' };

				fireChanges( event );

				expect( onFocus.calledOnce ).to.equal( true );
				expect( onFocus.firstCall.args[ 0 ] ).to.equal( event );
				expect( onFocus.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onBlur', () => {
			it( 'listens to the "viewDocument#blur" event in order to call "onBlur" callback', async () => {
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );
				sinon.stub( editorInstance, 'getData' ).returns( '<p>Foo.</p>' );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
				} );

				// More events are being attached to `viewDocument`.
				expect( viewDocument.on.calledTwice ).to.be.true;
				expect( viewDocument.on.secondCall.args[ 0 ] ).to.equal( 'blur' );
				expect( viewDocument.on.secondCall.args[ 1 ] ).to.be.a( 'function' );
			} );

			it( 'executes "onBlur" callback if it was specified and the editor was blurred', async () => {
				const onBlur = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onBlur={ onBlur } onReady={ res }/> );
				} );

				const fireChanges = viewDocument.on.secondCall.args[ 1 ];
				const event = { name: 'blur' };

				fireChanges( event );

				expect( onBlur.calledOnce ).to.equal( true );
				expect( onBlur.firstCall.args[ 0 ] ).to.equal( event );
				expect( onBlur.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onBlur" callback if it is available in runtime when the editor was blurred', async () => {
				const onBlur = sinon.spy();
				const editorInstance = new Editor();
				const viewDocument = Editor._editing.view.document;

				sinon.stub( Editor, 'create' ).resolves( editorInstance );

				await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res }/> );
				} );

				wrapper.setProps( { onBlur } );

				const fireChanges = viewDocument.on.secondCall.args[ 1 ];
				const event = { name: 'blur' };

				fireChanges( event );

				expect( onBlur.calledOnce ).to.equal( true );
				expect( onBlur.firstCall.args[ 0 ] ).to.equal( event );
				expect( onBlur.firstCall.args[ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onError', () => {
			it( 'calls the callback if specified when an error occurs', async () => {
				const originalError = new Error( 'Error was thrown.' );

				sinon.stub( Editor, 'create' ).rejects( originalError );

				const { error, details } = await new Promise( res => {
					wrapper = mount( <CKEditor editor={ Editor } onError={ ( error, details ) => res( { error, details } ) }/> );
				} );

				expect( error ).to.equal( error );
				expect( details.phase ).to.equal( 'initialization' );
				expect( details.willEditorRestart ).to.equal( false );
			} );

			it( 'calls the callback if the runtime error occurs', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }/> );
				} );

				const error = new CKEditorError( 'foo', wrapper.instance().editor );

				const onErrorSpy = sinon.spy();
				wrapper.setProps( { onError: onErrorSpy } );

				await turnOffDefaultErrorCatching( () => {
					return new Promise( res => {
						wrapper.setProps( { onReady: res } );

						setTimeout( () => {
							throw error;
						} );
					} );
				} );

				sinon.assert.calledOnce( onErrorSpy );

				expect( onErrorSpy.firstCall.args[ 0 ] ).to.equal( error );
				expect( onErrorSpy.firstCall.args[ 1 ].phase ).to.equal( 'runtime' );
				expect( onErrorSpy.firstCall.args[ 1 ].willEditorRestart ).to.equal( true );
			} );
		} );

		describe( '#disabled', () => {
			it( 'switches the editor to read-only mode if [disabled={true}]', done => {
				const onReady = editor => {
					expect( editor.isReadOnly ).to.be.true;

					done();
				};

				wrapper = mount( <CKEditor editor={ Editor } disabled={ true } onReady={ onReady }/> );
			} );

			it( 'switches the editor to read-only mode when [disabled={true}] property was set in runtime', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res } onError={ rej }/> );
				} );

				wrapper.setProps( { disabled: true } );

				expect( wrapper.instance().editor.isReadOnly ).to.be.true;
			} );

			it( 'disables the read-only mode when [disabled={false}] property was set in runtime', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor editor={ Editor } onReady={ res } onError={ rej } disabled={ true } /> );
				} );

				expect( wrapper.instance().editor.isReadOnly ).to.be.true;

				wrapper.setProps( { disabled: false } );

				expect( wrapper.instance().editor.isReadOnly ).to.be.false;
			} );
		} );

		describe( '#id', () => {
			it( 'should re-mount the editor if the attribute has changed', async () => {
				sinon.stub( Editor, 'create' ).callsFake( async () => new Editor() );

				const editor = await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						id="1"
					/> );
				} );

				sinon.assert.calledOnce( Editor.create );
				expect( Editor.create.firstCall.args[ 1 ].initialData ).to.equal( '<p>foo</p>' );

				const editor2 = await new Promise( res => {
					wrapper.setProps( { onReady: res, id: '2', config: { initialData: '<p>bar</p>' } } );
				} );

				sinon.assert.calledTwice( Editor.create );

				expect( Editor.create.secondCall.args[ 1 ].initialData ).to.equal( '<p>bar</p>' );

				expect( editor ).to.not.equal( editor2 );
			} );

			it( 'should not re-mount the editor if the attribute has not changed', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						id="1"
					/> );
				} );

				sinon.stub( Editor, 'create' ).callsFake( async () => new Editor() );

				wrapper.setProps( { id: '1', config: { initialData: '<p>bar</p>' } } );

				await new Promise( res => setTimeout( res ) );

				sinon.assert.notCalled( Editor.create );
			} );

			it( 'should destroy the old watchdog instance while re-mounting the editor', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						id="1"
					/> );
				} );

				const { watchdog: firstWatchdog } = wrapper.instance();

				await new Promise( res => {
					wrapper.setProps( { onReady: res, id: '2', config: { initialData: '<p>bar</p>' } } );
				} );

				const { watchdog: secondWatchdog } = wrapper.instance();

				expect( firstWatchdog ).to.not.equal( secondWatchdog );
				expect( firstWatchdog.state ).to.equal( 'destroyed' );
				expect( secondWatchdog.state ).to.equal( 'ready' );
			} );
		} );

		describe( '#disableWatchdog', () => {
			it( 'should not initialize watchdog if disableWatchdog is set to true', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						disableWatchdog={ true }
						id="1"
					/> );
				} );

				const { watchdog } = wrapper.instance();

				expect( watchdog ).to.equal( null );
			} );

			it( 'should initialize watchdog if disableWatchdog is set to false', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						disableWatchdog={ false }
						id="1"
					/> );
				} );

				const { watchdog } = wrapper.instance();

				expect( watchdog ).not.to.equal( null );
			} );

			it( 'should initialize watchdog if disableWatchdog is not set', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						id="1"
					/> );
				} );

				const { watchdog } = wrapper.instance();

				expect( watchdog ).not.to.equal( null );
			} );

			it( 'should re-render when disableWatchdog has changed', async () => {
				await new Promise( ( res, rej ) => {
					wrapper = mount( <CKEditor
						editor={ Editor }
						onReady={ res }
						onError={ rej }
						config={ { initialData: '<p>foo</p>' } }
						id="1"
					/> );
				} );

				const { watchdog: watchdog1 } = wrapper.instance();
				expect( watchdog1 ).not.to.equal( null );

				await new Promise( res => {
					wrapper.setProps( { onReady: res, disableWatchdog: true } );
				} );

				const { watchdog: watchdog2 } = wrapper.instance();
				expect( watchdog2 ).to.equal( null );

				await new Promise( res => {
					wrapper.setProps( { onReady: res, disableWatchdog: false } );
				} );

				const { watchdog: watchdog3 } = wrapper.instance();
				expect( watchdog3 ).not.to.equal( null );
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
					onReady={ res }
					onError={ rej }/> );
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

			await new Promise( ( res, rej ) => {
				wrapper = mount( <CKEditor
					editor={ Editor }
					onReady={ res }
					onError={ rej }/> );
			} );

			const component = wrapper.instance();

			expect( component.editor ).is.not.null;

			wrapper.unmount();
			wrapper = null;

			// Wait a cycle.
			await waitFor( () => {
				expect( component.editor ).is.null;
			} );
		} );
	} );

	describe( 'in case of error handling', () => {
		it( 'should restart the editor if a runtime error occurs', async () => {
			await new Promise( ( res, rej ) => {
				wrapper = mount( <CKEditor
					editor={ Editor }
					onReady={ res }
					onError={ rej }/> );
			} );

			const firstEditor = wrapper.instance().editor;

			expect( firstEditor ).to.be.instanceOf( Editor );

			await turnOffDefaultErrorCatching( () => {
				return new Promise( res => {
					wrapper.setProps( { onReady: res } );

					setTimeout( () => {
						throw new CKEditorError( 'foo', firstEditor );
					} );
				} );
			} );

			await waitFor( () => {
				const { editor } = wrapper.instance();

				expect( editor ).to.be.instanceOf( Editor );
				expect( firstEditor ).to.not.equal( editor );
			} );
		} );
	} );

	describe( 'semaphores', () => {
		let element;

		beforeEach( () => {
			element = document.createElement( 'div' );

			document.body.appendChild( element );
		} );

		afterEach( () => {
			element.remove();
		} );

		const testSemaphoreForWatchdog = enableWatchdog => {
			it( 'should assign properly `data` property to editor even if it is still mounting', async () => {
				const deferInitialization = createDefer();

				class SlowEditor extends Editor {
					constructor( element, config ) {
						super( element, config );

						let value = config.initialData || '';

						this.data = {
							get() {
								return value;
							},

							set( newValue ) {
								value = newValue;
							}
						};
					}

					static async create( ...args ) {
						await deferInitialization.promise;

						return new SlowEditor( ...args );
					}
				}

				let editor = null;
				const component = mount(
					<CKEditor
						disableWatchdog
						editor={ SlowEditor }
						config={ {
							initialData: '1',
							key: 1,
							abc: 123
						} }
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>,
					{
						attachTo: element
					}
				);

				await timeout( 100 );

				component.setProps( {
					data: 'Hello World'
				} );

				deferInitialization.resolve();

				await waitFor( () => {
					expect( editor ).not.to.be.null;
					expect( editor.data.get() ).to.be.equal( 'Hello World' );
				} );
			} );

			it( 'should set data in sync mode when editor is already mounted', async () => {
				class SlowEditor extends Editor {
					constructor( element, config ) {
						super( element, config );

						let value = config.initialData || '';

						this.data = {
							get() {
								return value;
							},

							set( newValue ) {
								value = newValue;
							}
						};
					}

					static async create( ...args ) {
						return new SlowEditor( ...args );
					}
				}

				const { component, editor } = await new Promise( resolve => {
					const _component = mount(
						<CKEditor
							disableWatchdog
							editor={ SlowEditor }
							config={ {
								initialData: '1',
								key: 1,
								abc: 123
							} }
							onReady={ resolvedEditor => {
								resolve( {
									component: _component,
									editor: resolvedEditor
								} );
							} }
						/>,
						{
							attachTo: element
						}
					);
				} );

				component.setProps( {
					data: 'Hello World'
				} );

				expect( editor.data.get() ).to.be.equal( 'Hello World' );
			} );

			it( 'should buffer many rerenders while creating editor', async () => {
				const initializerLog = [];

				class SlowEditor extends Editor {
					static async create( ...args ) {
						await timeout( 300 );

						return new SlowEditor( ...args );
					}
				}

				const component = mount(
					<CKEditor
						disableWatchdog={!enableWatchdog}
						editor={ SlowEditor }
						config={ {
							initialData: '1',
							key: 1,
							abc: 123
						} }
						onReady={ instance => {
							initializerLog.push( {
								status: 'ready',
								id: instance.config.key
							} );
						} }
						onAfterDestroy={ instance => {
							initializerLog.push( {
								status: 'destroy',
								id: instance.config.key
							} );
						} }
					/>,
					{
						attachTo: element
					}
				);

				component.setProps( {
					id: 111,
					config: {
						key: 2
					}
				} );

				await timeout( 50 );

				component.setProps( {
					id: 112,
					config: {
						key: 3
					}
				} );

				await timeout( 50 );

				component.setProps( {
					id: 113,
					config: {
						key: 4
					}
				} );

				await waitFor( () => {
					expect( initializerLog ).to.deep.equal( [
						{ status: 'ready', id: 2 },
						{ status: 'destroy', id: 2 },
						{ status: 'ready', id: 4 }
					] );
				} );
			} );
		};

		for ( const enableWatchdog of [ true, false ] ) {
			describe( `watchdog=${ enableWatchdog }`, () => testSemaphoreForWatchdog( enableWatchdog ) );
		}
	} );
} );
