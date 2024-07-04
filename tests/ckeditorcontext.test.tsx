/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, afterEach, it, expect, vi } from 'vitest';
import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import CKEditorContext, { useCKEditorWatchdogContext } from '../src/ckeditorcontext.tsx';
import CKEditor from '../src/ckeditor.tsx';
import MockedEditor from './_utils/editor.js';
import { ContextWatchdog, CKEditorError } from 'ckeditor5';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';
import ContextMock, { DeferredContextMock } from './_utils/context.js';
import { waitFor } from './_utils/waitFor.js';
import { timeout } from './_utils/timeout.js';
import { PromiseManager } from './_utils/render.js';

const MockEditor = MockedEditor as any;

describe( '<CKEditorContext> Component', () => {
	const manager: PromiseManager = new PromiseManager();
	let component: RenderResult | null = null;

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();

		component?.unmount();
		manager.clear();
	} );

	describe( 'initialization', () => {
		it( 'should create an instance of the ContextWatchdog', async () => {
			const myWatchdogConfig = { crashNumberLimit: 678 };
			let contextWatchdog: ContextWatchdog | null = null;

			component = render(
				<CKEditorContext
					context={ContextMock}
					contextWatchdog={ContextWatchdog}
					watchdogConfig={myWatchdogConfig}
					onReady={manager.resolveOnRun( ( _, watchdog ) => {
						contextWatchdog = watchdog;
					} )}
				/>
			);

			await manager.all();

			expect( contextWatchdog ).to.be.an( 'object' );
			expect( contextWatchdog ).to.be.instanceOf( ContextWatchdog );
		} );

		it( 'should pass the watchdog config to the ContextWatchdog', async () => {
			const myWatchdogConfig = { crashNumberLimit: 678 };
			let contextWatchdog: ContextWatchdog | null = null;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					watchdogConfig={ myWatchdogConfig }
					onReady={ manager.resolveOnRun( ( _, watchdog ) => {
						contextWatchdog = watchdog;
					} ) }
				/>
			);

			await manager.all();

			expect( contextWatchdog ).to.be.an( 'object' );
			expect( contextWatchdog ).to.be.instanceOf( ContextWatchdog );
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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

			component.setProps( {
				isLayoutReady: true
			} );

			await waitFor( () => {
				const { current } = contextRef;

				expect( current ).to.have.property( 'watchdog' );
				expect( current.status ).to.be.equal( 'initialized' );
				expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
			} );

			component.setProps( {
				isLayoutReady: false
			} );

			await waitFor( () => {
				expect( contextRef.current ).to.be.deep.equal( {
					status: 'initializing'
				} );
			} );
		} );

		it( 'should render its children', async () => {
			component = render(
				<CKEditorContext context={ ContextMock } contextWatchdog={ ContextWatchdog } >
					<div></div>
					<p>Foo</p>
				</CKEditorContext>
			);

			expect( component.childAt( 0 ).name() ).to.equal( 'div' );
			expect( component.childAt( 1 ).name() ).to.equal( 'p' );
		} );

		it( 'should render the inner editor component', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );

			component = render(
				<CKEditorContext context={ContextMock} contextWatchdog={ContextWatchdog} >
					<CKEditor editor={MockEditor} onReady={ manager.resolveOnRun() } />
				</CKEditorContext>
			);

			await manager.all();

			expect( component.childAt( 0 ).name() ).to.equal( 'CKEditor' );
			expect( component.childAt( 0 ).prop( 'editor' ) ).to.be.a( 'function' );
			expect( component.childAt( 0 ).instance().editor ).to.be.an( 'object' );
			expect( editorCreateSpy ).toHaveBeenCalledOnce();

			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ] ).to.have.property( 'context' );
		} );

		it( 'should initialize its inner editors correctly', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					onReady={ manager.resolveOnRun() }
				>
					<CKEditor editor={ MockEditor } config={ { initialData: '<p>Foo</p>' } } />
					<CKEditor editor={ MockEditor } config={ { initialData: '<p>Bar</p>' } } />
				</CKEditorContext>
			);

			await manager.all();

			await waitFor( () => {
				const editor1 = component.childAt( 0 ).instance().editor;
				const editor2 = component.childAt( 1 ).instance().editor;

				expect( editor1 ).to.be.an( 'object' );
				expect( editor2 ).to.be.an( 'object' );
			} );

			expect( editorCreateSpy ).toHaveBeenCalledTimes( 2 );

			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ].initialData ).to.equal( '<p>Foo</p>' );
			expect( editorCreateSpy.mock.calls[ 1 ][ 1 ].initialData ).to.equal( '<p>Bar</p>' );

			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( editorCreateSpy.mock.calls[ 1 ][ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ].context ).to.equal( editorCreateSpy.mock.calls[ 1 ][ 1 ].context );
		} );

		it( 'should wait for the `ContextWatchdog#destroy()` promise when destroying the context feature', async () => {
			let watchdog: ContextWatchdog;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					onReady={ manager.resolveOnRun( ( _, instance ) => {
						watchdog = instance;
					} ) }
				/>
			);

			await manager.all();

			component.unmount();
			component = null;

			await waitFor( () => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				expect( watchdog._context ).to.equal( null );
			} );
		} );
	} );

	describe( 'properties', () => {
		describe( '#onError', () => {
			it( 'should be called when an initialization error occurs', async () => {
				let errorEvent;
				const error = new Error();

				vi.spyOn( ContextWatchdog.prototype, 'create' ).mockRejectedValue( error );
				vi.spyOn( ContextWatchdog.prototype, 'add' ).mockResolvedValue( [] );

				component = render(
					<CKEditorContext
						context={ ContextMock }
						contextWatchdog={ ContextWatchdog }
						onError={ manager.resolveOnRun( ( error, details ) => {
							errorEvent = { error, details };
						} ) }
					>
						<CKEditor editor={ MockEditor } />
					</CKEditorContext>
				);

				await manager.all();

				expect( errorEvent ).to.be.an( 'object' );
				expect( errorEvent.error ).to.equal( error );
				expect( errorEvent.details ).to.deep.equal( {
					phase: 'initialization',
					willContextRestart: false
				} );
			} );

			it( 'should be called when a runtime error occurs', async () => {
				const onErrorSpy = vi.fn();
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

				expect( onErrorSpy ).toHaveBeenCalledOnce();
				const errorEventArgs = onErrorSpy.mock.calls[ 0 ];

				expect( errorEventArgs[ 0 ] ).to.equal( error );
				expect( errorEventArgs[ 1 ] ).to.deep.equal( {
					phase: 'runtime',
					willContextRestart: true
				} );

				expect( contextRef.current!.status ).to.be.equal( 'initialized' );
			} );

			it( 'displays an error if something went wrong and "onError" callback was not specified', async () => {
				const error = new Error( 'Something went wrong.' );
				const consoleErrorStub = vi.spyOn( console, 'error' );

				vi.spyOn( ContextWatchdog.prototype, 'create' ).mockRejectedValue( error );

				const { contextRef, defer } = mountAndReadReactContextValueRef();
				defer.resolve();

				await waitFor( () => {
					const { current } = contextRef;

					expect( consoleErrorStub ).toHaveBeenCalledOnce();
					consoleErrorStub.mockRestore();

					expect( current ).to.have.property( 'status' );
					expect( current.status ).to.be.equal( 'error' );
					expect( current.error ).to.be.equal( error );
				} );
			} );
		} );

		describe( '#onReady', () => {
			it( 'should be called when all editors are ready', async () => {
				const editorReadySpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ContextMock }
						contextWatchdog={ ContextWatchdog }
						onReady={ manager.resolveOnRun() }
					>
						<CKEditor editor={ MockEditor } onReady={ editorReadySpy } config={ { initialData: '<p>Foo</p>' } } />
						<CKEditor editor={ MockEditor } onReady={ editorReadySpy } config={ { initialData: '<p>Bar</p>' } } />
					</CKEditorContext>
				);

				await manager.all();

				// A small hack - currently editors are ready one cycle after the context is ready.
				await new Promise( res => setTimeout( res ) );

				expect( editorReadySpy ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );

	describe( 'restarting CKEditorContext with nested CKEditor components', () => {
		it( 'should restart the Context and all editors if the Context#id has changed', async () => {
			let oldContext: ContextMock;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					onReady={ manager.resolveOnRun( context => {
						oldContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			const newContext = await new Promise( res => {
				component.setProps( {
					id: '2',
					onReady: res
				} );
			} );

			expect( newContext ).to.not.equal( oldContext! );
			expect( newContext ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should re-render the entire component when the layout is ready', async () => {
			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					isLayoutReady={ false }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			const context = await new Promise( res => {
				component.setProps( {
					onReady: res,
					isLayoutReady: true
				} );
			} );

			expect( context ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should not create the component watchdog if layout is not ready', async () => {
			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					isLayoutReady={ false }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			const { watchdog: firstWatchdog } = component.childAt( 0 ).instance();

			expect( firstWatchdog ).to.equal( null );

			await new Promise( res => {
				component.setProps( {
					onReady: res,
					isLayoutReady: true
				} );
			} );

			await waitFor( () => {
				const { watchdog: secondWatchdog } = component.childAt( 0 ).instance();

				expect( secondWatchdog ).to.not.equal( null );
				expect( secondWatchdog._contextWatchdog.state ).to.equal( 'ready' );
			} );
		} );

		it( 'should restart the Context and all editors if children has changed', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const { waitForInitialize } = mountAndReadReactContextValueRef(
				{},
				<CKEditor editor={ MockEditor } config={{ initialData: 'Hello World' }} />
			);

			await waitForInitialize();

			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ].initialData ).to.equal( 'Hello World' );
			component.setProps( {
				children: [
					// The `key` property is required when defining children this way.
					// See: https://reactjs.org/docs/lists-and-keys.html#keys.
					<CKEditor editor={ MockEditor } key="id-1" config={{ initialData: 'Foo' }} />,
					<CKEditor editor={ MockEditor } key="id-2" config={{ initialData: 'Bar' }} />
				]
			} );

			await waitFor( () => {
				expect( editorCreateSpy ).toHaveBeenCalledTimes( 2 );
				expect( editorCreateSpy.mock.calls[ 1 ][ 1 ].initialData ).to.equal( 'Foo' );
				expect( editorCreateSpy.mock.calls[ 2 ][ 1 ].initialData ).to.equal( 'Bar' );
			} );
		} );
	} );

	function mountAndReadReactContextValueRef(
		props = {},
		children = <CKEditor editor={ MockEditor } />
	) {
		const deferContext = DeferredContextMock.create();
		const contextRef = {
			current: null
		};

		const ContextReader = () => {
			contextRef.current = useCKEditorWatchdogContext();
			return null;
		};

		component = render(
			<CKEditorContext
				context={ deferContext }
				contextWatchdog={ ContextWatchdog }
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
				expect( contextRef.current!.status ).to.be.equal( 'initialized' );
			} );
		};

		return {
			defer: deferContext.defer,
			wrapper: component,
			contextRef,
			waitForInitialize
		};
	}
} );

describe( 'EditorWatchdogAdapter', () => {
	const manager: PromiseManager = new PromiseManager();
	let component: RenderResult | null = null;

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();

		component?.unmount();
		manager.clear();
	} );

	describe( '#on', () => {
		const error = new Error( 'Example error.' );

		it( 'should execute the onError callback if an error was reported by the CKEditorContext component', async () => {
			const errorSpy = vi.fn();

			component = render(
				<CKEditorContext
					context={ContextMock}
					contextWatchdog={ContextWatchdog}
					id="1"
				>
					<CKEditor
						editor={MockEditor}
						onReady={ manager.resolveOnRun() }
						onError={errorSpy}
					/>
				</CKEditorContext>
			);

			await manager.all();

			const { watchdog } = component.childAt( 0 ).instance();

			watchdog._contextWatchdog._fire( 'itemError', { error, itemId: watchdog._id } );

			expect( errorSpy.mock.calls.length ).to.equal( 1 );
			expect( errorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( error );
		} );

		it( 'should execute the onError callback for proper editor', async () => {
			const firstEditorErrorSpy = vi.fn();
			const secondEditorErrorSpy = vi.fn();

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
				>
					<CKEditor
						editor={ MockEditor }
						onReady={ manager.resolveOnRun() }
						onError={ firstEditorErrorSpy }
					/>

					<CKEditor
						editor={ MockEditor }
						onReady={ manager.resolveOnRun() }
						onError={ secondEditorErrorSpy }
					/>
				</CKEditorContext>
			);

			await manager.all();

			// Report an error for the second editor.
			const { watchdog } = component.childAt( 1 ).instance();

			watchdog._contextWatchdog._fire( 'itemError', { error, itemId: watchdog._id } );

			expect( firstEditorErrorSpy ).toHaveBeenCalledOnce();
			expect( secondEditorErrorSpy ).toHaveBeenCalledOnce();
			expect( secondEditorErrorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( error );
		} );
	} );
} );
