/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CKEditorContext, { useCKEditorWatchdogContext } from '../src/ckeditorcontext.tsx';
import CKEditor from '../src/ckeditor.tsx';
import EditorMock from './_utils/editor.js';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';
import ContextMock, { DeferredContextMock } from './_utils/context.js';

import { waitFor } from './_utils/waitFor.js';
import { timeout } from './_utils/timeout.js';

configure( { adapter: new Adapter() } );

describe( '<CKEditorContext> Component', () => {
	let wrapper;

	afterEach( () => {
		sinon.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'initialization', () => {
		it( 'should create an instance of the ContextWatchdog', async () => {
			const myWatchdogConfig = { crashNumberLimit: 678 };
			const contextWatchdog = await new Promise( res => {
				wrapper = mount(
					<CKEditorContext
						context={ ContextMock }
						watchdogConfig={ myWatchdogConfig }
						onReady={ ( _, watchdog ) => res( watchdog ) }
					/>
				);
			} );

			expect( contextWatchdog ).to.be.an( 'object' );
			expect( contextWatchdog ).to.be.instanceOf( ContextWatchdog );
		} );

		it( 'should pass the watchdog config to the ContextWatchdog', async () => {
			const myWatchdogConfig = { crashNumberLimit: 678 };
			const contextWatchdog = await new Promise( res => {
				wrapper = mount(
					<CKEditorContext
						context={ ContextMock }
						watchdogConfig={ myWatchdogConfig }
						onReady={ ( _, watchdog ) => res( watchdog ) }
					/>
				);
			} );

			expect( contextWatchdog ).to.be.an( 'object' );
			expect( contextWatchdog ).to.be.instanceOf( ContextWatchdog );
			expect( contextWatchdog._crashNumberLimit ).to.equal( myWatchdogConfig.crashNumberLimit );
		} );

		it( 'should be initialized with the context instance', async () => {
			const { contextRef, defer } = mountAndReadReactContextValueRef();

			expect( contextRef.current ).to.be.deep.equal( {
				status: 'initializing'
			} );

			defer.resolve();

			await waitFor( () => {
				const { current } = contextRef;

				expect( current ).to.have.property( 'watchdog' );
				expect( current.status ).to.be.equal( 'initialized' );
				expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
			} );
		} );

		it( 'should not create anything if the layout is not ready', async () => {
			const { contextRef, defer } = mountAndReadReactContextValueRef( {
				isLayoutReady: false
			} );

			expect( contextRef.current ).to.be.deep.equal( {
				status: 'initializing'
			} );

			defer.resolve();
			await timeout( 100 );

			// It should keep in `initializing` state even if deferred.
			expect( contextRef.current ).to.be.deep.equal( {
				status: 'initializing'
			} );

			wrapper.setProps( {
				isLayoutReady: true
			} );

			await waitFor( () => {
				const { current } = contextRef;

				expect( current ).to.have.property( 'watchdog' );
				expect( current.status ).to.be.equal( 'initialized' );
				expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
			} );

			wrapper.setProps( {
				isLayoutReady: false
			} );

			await waitFor( () => {
				expect( contextRef.current ).to.be.deep.equal( {
					status: 'initializing'
				} );
			} );
		} );

		it( 'should render its children', async () => {
			wrapper = mount(
				<CKEditorContext context={ ContextMock } >
					<div></div>
					<p>Foo</p>
				</CKEditorContext>
			);

			expect( wrapper.childAt( 0 ).name() ).to.equal( 'div' );
			expect( wrapper.childAt( 1 ).name() ).to.equal( 'p' );
		} );

		it( 'should render the inner editor component', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );

			await new Promise( ( res, rej ) => {
				wrapper = mount(
					<CKEditorContext context={ ContextMock } onError={ rej } >
						<CKEditor editor={ EditorMock } onReady={ res } onError={ rej } />
					</CKEditorContext>
				);
			} );

			expect( wrapper.childAt( 0 ).name() ).to.equal( 'CKEditor' );
			expect( wrapper.childAt( 0 ).prop( 'editor' ) ).to.be.a( 'function' );
			expect( wrapper.childAt( 0 ).instance().editor ).to.be.an( 'object' );

			sinon.assert.calledOnce( editorCreateSpy );

			expect( editorCreateSpy.firstCall.args[ 1 ] ).to.have.property( 'context' );
		} );

		it( 'should initialize its inner editors correctly', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );

			await new Promise( ( res, rej ) => {
				wrapper = mount(
					<CKEditorContext
						context={ ContextMock }
						onError={ rej }
						onReady={ ( _, watchdog ) => res( watchdog ) }
					>
						<CKEditor editor={ EditorMock } config={ { initialData: '<p>Foo</p>' } } />
						<CKEditor editor={ EditorMock } config={ { initialData: '<p>Bar</p>' } } />
					</CKEditorContext>
				);
			} );

			await waitFor( () => {
				const editor1 = wrapper.childAt( 0 ).instance().editor;
				const editor2 = wrapper.childAt( 1 ).instance().editor;

				expect( editor1 ).to.be.an( 'object' );
				expect( editor2 ).to.be.an( 'object' );
			} );

			sinon.assert.calledTwice( editorCreateSpy );

			expect( editorCreateSpy.firstCall.args[ 1 ].initialData ).to.equal( '<p>Foo</p>' );
			expect( editorCreateSpy.secondCall.args[ 1 ].initialData ).to.equal( '<p>Bar</p>' );

			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( editorCreateSpy.secondCall.args[ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( editorCreateSpy.firstCall.args[ 1 ].context ).to.equal( editorCreateSpy.secondCall.args[ 1 ].context );
		} );

		it( 'should wait for the `ContextWatchdog#destroy()` promise when destroying the context feature', async () => {
			const watchdog = await new Promise( ( res, rej ) => {
				wrapper = mount(
					<CKEditorContext
						context={ ContextMock }
						onError={ rej }
						onReady={ ( _, watchdog ) => res( watchdog ) }
					/>
				);
			} );

			wrapper.unmount();
			wrapper = null;

			await waitFor( () => {
				expect( watchdog._context ).to.equal( null );
			} );
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
						<CKEditorContext
							context={ ContextMock }
							onError={ ( error, details ) => res( { error, details } ) }
						>
							<CKEditor editor={ EditorMock } />
						</CKEditorContext>
					);
				} );

				expect( errorEvent ).to.be.an( 'object' );
				expect( errorEvent.error ).to.equal( error );
				expect( errorEvent.details ).to.deep.equal( {
					phase: 'initialization',
					willContextRestart: false
				} );
			} );

			it( 'should be called when a runtime error occurs', async () => {
				const onErrorSpy = sinon.spy();
				const { contextRef, defer } = mountAndReadReactContextValueRef( {
					onError: onErrorSpy
				} );

				defer.resolve();

				await waitFor( () => {
					const { current } = contextRef;

					expect( current ).to.have.property( 'watchdog' );
					expect( current.status ).to.be.equal( 'initialized' );
					expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
				} );

				const { watchdog } = contextRef.current;
				const error = new CKEditorError( 'foo', watchdog.context );

				await turnOffDefaultErrorCatching( async () => {
					setTimeout( () => {
						throw error;
					} );

					await timeout( 150 );
				} );

				sinon.assert.calledOnce( onErrorSpy );
				const errorEventArgs = onErrorSpy.firstCall.args;

				expect( errorEventArgs[ 0 ] ).to.equal( error );
				expect( errorEventArgs[ 1 ] ).to.deep.equal( {
					phase: 'runtime',
					willContextRestart: true
				} );

				expect( contextRef.current.status ).to.be.equal( 'initialized' );
			} );

			it( 'displays an error if something went wrong and "onError" callback was not specified', async () => {
				const error = new Error( 'Something went wrong.' );
				const consoleErrorStub = sinon.stub( console, 'error' );

				sinon.stub( ContextWatchdog.prototype, 'create' ).rejects( error );

				const { contextRef, defer } = mountAndReadReactContextValueRef();
				defer.resolve();

				await waitFor( () => {
					const { current } = contextRef;

					expect( consoleErrorStub.callCount ).to.equal( 1 );
					consoleErrorStub.restore();

					expect( current ).to.have.property( 'status' );
					expect( current.status ).to.be.equal( 'error' );
					expect( current.error ).to.be.equal( error );
				} );
			} );
		} );

		describe( '#onReady', () => {
			it( 'should be called when all editors are ready', async () => {
				const editorReadySpy = sinon.spy();

				await new Promise( ( res, rej ) => {
					wrapper = mount(
						<CKEditorContext context={ ContextMock } onReady={ res } onError={ rej } >
							<CKEditor editor={ EditorMock } onReady={ editorReadySpy } config={ { initialData: '<p>Foo</p>' } } />
							<CKEditor editor={ EditorMock } onReady={ editorReadySpy } config={ { initialData: '<p>Bar</p>' } } />
						</CKEditorContext>
					);
				} );

				// A small hack - currently editors are ready one cycle after the context is ready.
				await new Promise( res => setTimeout( res ) );

				sinon.assert.calledTwice( editorReadySpy );
			} );
		} );
	} );

	describe( 'restarting CKEditorContext with nested CKEditor components', () => {
		it( 'should restart the Context and all editors if the Context#id has changed', async () => {
			const oldContext = await new Promise( res => {
				wrapper = mount(
					<CKEditorContext context={ ContextMock } id="1" onReady={ res }>
						<CKEditor editor={ EditorMock } />
					</CKEditorContext>
				);
			} );

			const newContext = await new Promise( res => {
				wrapper.setProps( {
					id: '2',
					onReady: res
				} );
			} );

			expect( newContext ).to.not.equal( oldContext );
			expect( newContext ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should re-render the entire component when the layout is ready', async () => {
			wrapper = mount(
				<CKEditorContext context={ ContextMock } id="1" isLayoutReady={ false }>
					<CKEditor editor={ EditorMock } />
				</CKEditorContext>
			);

			const context = await new Promise( res => {
				wrapper.setProps( {
					onReady: res,
					isLayoutReady: true
				} );
			} );

			expect( context ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should not create the component watchdog if layout is not ready', async () => {
			wrapper = mount(
				<CKEditorContext context={ ContextMock } id="1" isLayoutReady={ false }>
					<CKEditor editor={ EditorMock } />
				</CKEditorContext>
			);

			const { watchdog: firstWatchdog } = wrapper.childAt( 0 ).instance();

			expect( firstWatchdog ).to.equal( null );

			await new Promise( res => {
				wrapper.setProps( {
					onReady: res,
					isLayoutReady: true
				} );
			} );

			await waitFor( () => {
				const { watchdog: secondWatchdog } = wrapper.childAt( 0 ).instance();

				expect( secondWatchdog ).to.not.equal( null );
				expect( secondWatchdog._contextWatchdog.state ).to.equal( 'ready' );
			} );
		} );

		it( 'should restart the Context and all editors if children has changed', async () => {
			const editorCreateSpy = sinon.spy( EditorMock, 'create' );
			const { waitForInitialize } = mountAndReadReactContextValueRef(
				{},
				<CKEditor editor={ EditorMock } config={{ initialData: 'Hello World' }} />
			);

			await waitForInitialize();

			expect( editorCreateSpy.firstCall.args[ 1 ].initialData ).to.equal( 'Hello World' );
			wrapper.setProps( {
				children: [
					// The `key` property is required when defining children this way.
					// See: https://reactjs.org/docs/lists-and-keys.html#keys.
					<CKEditor editor={ EditorMock } key="id-1" config={{ initialData: 'Foo' }} />,
					<CKEditor editor={ EditorMock } key="id-2" config={{ initialData: 'Bar' }} />
				]
			} );

			await waitFor( () => {
				sinon.assert.calledThrice( editorCreateSpy );

				expect( editorCreateSpy.secondCall.args[ 1 ].initialData ).to.equal( 'Foo' );
				expect( editorCreateSpy.thirdCall.args[ 1 ].initialData ).to.equal( 'Bar' );
			} );
		} );
	} );

	function mountAndReadReactContextValueRef(
		props = {},
		children = <CKEditor editor={ EditorMock } />
	) {
		const deferContext = DeferredContextMock.create();
		const contextRef = {
			current: null
		};

		const ContextReader = () => {
			contextRef.current = useCKEditorWatchdogContext();
			return null;
		};

		wrapper = mount(
			<CKEditorContext
				context={ deferContext }
				watchdogConfig={ { crashNumberLimit: 678 } }
				{...props}
			>
				<ContextReader />
				{ children }
			</CKEditorContext>
		);

		const waitForInitialize = async () => {
			deferContext.defer.resolve();

			await waitFor( () => {
				expect( contextRef.current.status ).to.be.equal( 'initialized' );
			} );
		};

		return {
			defer: deferContext.defer,
			wrapper,
			contextRef,
			waitForInitialize
		};
	}
} );

describe( 'EditorWatchdogAdapter', () => {
	let wrapper;

	afterEach( () => {
		sinon.restore();

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( '#on', () => {
		const error = new Error( 'Example error.' );

		it( 'should execute the onError callback if an error was reported by the CKEditorContext component', async () => {
			const errorSpy = sinon.spy();

			await new Promise( res => {
				wrapper = mount(
					<CKEditorContext context={ ContextMock } id="1">
						<CKEditor editor={ EditorMock } onReady={ res } onError={ errorSpy } />
					</CKEditorContext>
				);
			} );

			const { watchdog } = wrapper.childAt( 0 ).instance();

			watchdog._contextWatchdog._fire( 'itemError', { error, itemId: watchdog._id } );

			expect( errorSpy.calledOnce ).to.equal( true );
			expect( errorSpy.firstCall.args[ 0 ] ).to.equal( error );
		} );

		it( 'should execute the onError callback for proper editor', async () => {
			const firstEditorErrorSpy = sinon.spy();
			const secondEditorErrorSpy = sinon.spy();

			await new Promise( res => {
				wrapper = mount(
					<CKEditorContext context={ ContextMock } id="1">
						<CKEditor editor={ EditorMock } onReady={ res } onError={ firstEditorErrorSpy } />
						<CKEditor editor={ EditorMock } onReady={ res } onError={ secondEditorErrorSpy } />
					</CKEditorContext>
				);
			} );

			// Report an error for the second editor.
			const { watchdog } = wrapper.childAt( 1 ).instance();

			watchdog._contextWatchdog._fire( 'itemError', { error, itemId: watchdog._id } );

			expect( firstEditorErrorSpy.called ).to.equal( false );
			expect( secondEditorErrorSpy.calledOnce ).to.equal( true );
			expect( secondEditorErrorSpy.firstCall.args[ 0 ] ).to.equal( error );
		} );
	} );
} );
