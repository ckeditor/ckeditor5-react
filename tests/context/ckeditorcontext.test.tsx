/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, afterEach, it, expect, vi } from 'vitest';
import React, { createRef, StrictMode } from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import CKEditorContext, {
	useCKEditorWatchdogContext,
	type Props,
	type ContextWatchdogValue,
	type ExtractContextWatchdogValueByStatus
} from '../../src/context/ckeditorcontext.js';

import CKEditor from '../../src/ckeditor.js';
import MockedEditor from '../_utils/editor.js';
import { ClassicEditor, ContextWatchdog, CKEditorError } from 'ckeditor5';
import turnOffDefaultErrorCatching from '../_utils/turnoffdefaulterrorcatching.js';
import ContextMock, { DeferredContextMock } from '../_utils/context.js';
import { timeout } from '../_utils/timeout.js';
import { PromiseManager } from '../_utils/promisemanager.js';

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
				expect( current!.status ).to.be.equal( 'initialized' );

				if ( current?.status === 'initialized' ) {
					expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
				}
			} );
		} );

		it( 'should not create anything if the layout is not ready', async () => {
			const { contextRef, defer, rerender } = mountAndReadReactContextValueRef( {
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

			rerender( {
				isLayoutReady: true
			} );

			await waitFor( () => {
				const { current } = contextRef;

				expect( current ).to.have.property( 'watchdog' );
				expect( current!.status ).to.be.equal( 'initialized' );

				if ( current?.status === 'initialized' ) {
					expect( current.watchdog ).to.be.an.instanceOf( ContextWatchdog );
				}
			} );

			rerender( {
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
					<div>Bar</div>
					<p>Foo</p>
				</CKEditorContext>
			);

			expect( component.queryByText( 'Bar' ) ).not.to.be.null;
			expect( component.queryByText( 'Foo' ) ).not.to.be.null;
		} );

		it( 'should render the inner editor component', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const editorRef = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext context={ContextMock} contextWatchdog={ContextWatchdog} >
					<CKEditor ref={editorRef} editor={MockEditor} onReady={ manager.resolveOnRun() } />
				</CKEditorContext>
			);

			await manager.all();

			expect( editorRef.current!.editor ).to.be.a( 'object' );
			expect( editorCreateSpy ).toHaveBeenCalledOnce();

			expect( editorCreateSpy.mock.calls[ 0 ][ 1 ] ).to.have.property( 'context' );
		} );

		it( 'should initialize its inner editors correctly', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const editor1Ref = createRef<CKEditor<any>>();
			const editor2Ref = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					onReady={ manager.resolveOnRun() }
				>
					<CKEditor
						ref={ editor1Ref }
						editor={ MockEditor }
						config={ { initialData: '<p>Foo</p>' } }
					/>

					<CKEditor
						ref={ editor2Ref }
						editor={ MockEditor }
						config={ { initialData: '<p>Bar</p>' } }
					/>
				</CKEditorContext>
			);

			await manager.all();

			await waitFor( () => {
				const editor1 = editor1Ref.current!.editor;
				const editor2 = editor2Ref.current!.editor;

				expect( editor1 ).to.be.an( 'object' );
				expect( editor2 ).to.be.an( 'object' );
			} );

			expect( editorCreateSpy ).toHaveBeenCalledTimes( 2 );

			const calls = editorCreateSpy.mock.calls as any;

			expect( calls[ 0 ][ 1 ].initialData ).to.equal( '<p>Foo</p>' );
			expect( calls[ 1 ][ 1 ].initialData ).to.equal( '<p>Bar</p>' );

			expect( calls[ 0 ][ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( calls[ 1 ][ 1 ].context ).to.be.instanceOf( ContextMock );
			expect( calls[ 0 ][ 1 ].context ).to.equal( calls[ 1 ][ 1 ].context );
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
				vi.spyOn( console, 'error' ).mockImplementation( () => {} );

				const onErrorSpy = vi.fn();
				const { contextRef, defer } = mountAndReadReactContextValueRef( {
					onError: onErrorSpy
				} );

				defer.resolve();

				await waitFor( () => {
					const { current } = contextRef;

					expect( current ).to.have.property( 'watchdog' );
					expect( current!.status ).to.be.equal( 'initialized' );

					if ( current?.status === 'initialized' ) {
						expect( current!.watchdog ).to.be.an.instanceOf( ContextWatchdog );
					}
				} );

				const { watchdog } = contextRef.current as ExtractContextWatchdogValueByStatus<'initialized'>;
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
				const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

				vi.spyOn( ContextWatchdog.prototype, 'create' ).mockRejectedValue( error );

				const { contextRef, defer } = mountAndReadReactContextValueRef();
				defer.resolve();

				await waitFor( () => {
					const { current } = contextRef;

					expect( consoleErrorStub ).toHaveBeenCalledOnce();
					consoleErrorStub.mockRestore();

					expect( current ).to.have.property( 'status' );
					expect( current!.status ).to.be.equal( 'error' );

					if ( current?.status === 'error' ) {
						expect( current!.error ).to.be.equal( error );
					}
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

		describe( '#onChangeInitializedEditors', () => {
			it( 'should call the callback once in strict mode', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<StrictMode>
						<CKEditorContext
							context={ ClassicEditor.Context }
							contextWatchdog={ ClassicEditor.ContextWatchdog }
							onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
						>
							<CKEditor editor={ ClassicEditor } />
						</CKEditorContext>
					</StrictMode>
				);

				await timeout( 200 );
				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();
				} );
			} );

			it( 'should use editor uuid as key in the editors map', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						contextWatchdog={ ClassicEditor.ContextWatchdog }
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor editor={ ClassicEditor } />
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();

					const [ editors, watchdog ] = onChangeInitializedEditorsSpy.mock.lastCall!;
					const [ editorId ] = Object.keys( editors );

					// Ensure that the editor UUID is returned.
					expect( editorId ).to.have.length( 33 );
					expect( editors[ editorId ].instance ).to.be.instanceOf( ClassicEditor );

					// Expect that watchdog is an instance of the ContextWatchdog.
					expect( watchdog ).to.be.instanceOf( ClassicEditor.ContextWatchdog );
				} );
			} );

			it( 'should use editorName property passed to the CKEditor component as key in the editors map', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						contextWatchdog={ ClassicEditor.ContextWatchdog }
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ { name: 'my-editor' } }
						/>
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();

					const [ editors ] = onChangeInitializedEditorsSpy.mock.lastCall!;
					const editorId = 'my-editor';

					expect( editors ).to.have.property( editorId );
					expect( editors[ editorId ].instance ).to.be.instanceOf( ClassicEditor );
				} );
			} );

			it( 'should initialized multiple editors and track them', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						contextWatchdog={ ClassicEditor.ContextWatchdog }
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ { name: 'editor1' } }
						/>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ { name: 'editor2' } }
						/>
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledTimes( 2 );

					const [ editors ] = onChangeInitializedEditorsSpy.mock.lastCall!;

					expect( Object.keys( editors ) ).to.have.length( 2 );
					expect( editors ).to.have.property( 'editor1' );
					expect( editors ).to.have.property( 'editor2' );
				} );
			} );

			it( 'should be possible to forward metadata to the editors map', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						contextWatchdog={ ClassicEditor.ContextWatchdog }
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ {
								name: 'editor1',
								stuff: 2
							} }
						/>
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();

					const [ editors ] = onChangeInitializedEditorsSpy.mock.lastCall!;
					const editorId = 'editor1';

					expect( editors[ editorId ].metadata ).to.deep.equal( {
						name: 'editor1',
						stuff: 2
					} );
				} );
			} );

			it( 'should track only initialized editors', async () => {
				const onChangeInitializedEditorsSpy = vi.fn().mockImplementation( ( editors: any ) => {
					expect( editors.editor1.instance.state ).to.be.equal( 'ready' );
				} );

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						contextWatchdog={ ClassicEditor.ContextWatchdog }
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ {
								name: 'editor1'
							} }
						/>
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();
				} );
			} );
		} );
	} );

	describe( 'restarting CKEditorContext with nested CKEditor components', () => {
		it( 'should restart the Context and all editors if the Context#id has changed', async () => {
			let oldContext: ContextMock, newContext: ContextMock;

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

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="2"
					onReady={ manager.resolveOnRun( context => {
						newContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			expect( newContext! ).to.not.equal( oldContext! );
			expect( newContext! ).to.be.an.instanceOf( ContextMock );
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

			let newContext: ContextMock;

			component.rerender(
				<CKEditorContext
					isLayoutReady
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="2"
					onReady={ manager.resolveOnRun( context => {
						newContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			expect( newContext! ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should not create the component watchdog if layout is not ready', async () => {
			const editorRef = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					isLayoutReady={ false }
				>
					<CKEditor
						ref={editorRef}
						editor={ MockEditor }
					/>
				</CKEditorContext>
			);

			await timeout( 300 );

			const { watchdog: firstWatchdog } = editorRef.current!;

			expect( firstWatchdog ).to.equal( null );

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
				>
					<CKEditor
						ref={editorRef}
						editor={ MockEditor }
					/>
				</CKEditorContext>
			);

			await waitFor( () => {
				const { watchdog: secondWatchdog } = editorRef.current!;

				expect( secondWatchdog ).to.not.equal( null );
				expect( ( secondWatchdog as any )._contextWatchdog.state ).to.equal( 'ready' );
			} );
		} );

		it( 'should restart the Context and all editors if children has changed', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const { waitForInitialize, rerender } = mountAndReadReactContextValueRef(
				{},
				<CKEditor editor={ MockEditor } config={{ initialData: 'Hello World' }} />
			);

			await waitForInitialize();

			expect( ( editorCreateSpy.mock.calls as any )[ 0 ][ 1 ].initialData ).to.equal( 'Hello World' );

			rerender( {
				isLayoutReady: true,
				children: [
					// The `key` property is required when defining children this way.
					// See: https://reactjs.org/docs/lists-and-keys.html#keys.
					<CKEditor
						editor={MockEditor}
						key="id-1"
						config={{ initialData: 'Foo' }}
						onReady={manager.resolveOnRun()}
					/>,
					<CKEditor
						editor={MockEditor}
						key="id-2"
						config={{ initialData: 'Bar' }}
						onReady={manager.resolveOnRun()}
					/>
				]
			} );

			await manager.all();
			await waitFor( () => {
				expect( editorCreateSpy ).toHaveBeenCalledTimes( 3 );
				expect( ( editorCreateSpy.mock.calls as any )[ 1 ][ 1 ].initialData ).to.equal( 'Foo' );
				expect( ( editorCreateSpy.mock.calls as any )[ 2 ][ 1 ].initialData ).to.equal( 'Bar' );
			} );
		} );
	} );

	describe( 'fast re-initialization of multiroot editor', () => {
		it( 'should reinitialize the context watchdog when the context changes', async () => {
			let firstContext: ContextMock | null = null;
			let secondContext: ContextMock | null = null;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					onReady={ manager.resolveOnRun( context => {
						firstContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="2"
					onReady={ manager.resolveOnRun( context => {
						secondContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			expect( firstContext ).to.not.equal( secondContext );
			expect( secondContext ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should initialize only the first and the last context if few rerenders happened in a row', async () => {
			let firstContext: ContextMock | null = null;
			let secondContext: ContextMock | null = null;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
					onReady={ manager.resolveOnRun( context => {
						firstContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			const ignoredOnReadySpy = vi.fn();

			for ( let i = 0; i < 5; ++i ) {
				component.rerender(
					<CKEditorContext
						context={ ContextMock }
						contextWatchdog={ ContextWatchdog }
						id={`rerender-${ i }`}
						onReady={ignoredOnReadySpy}
					>
						<CKEditor editor={ MockEditor } />
					</CKEditorContext>
				);
			}

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="final"
					onReady={ manager.resolveOnRun( context => {
						secondContext = context;
					} ) }
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await manager.all();

			expect( ignoredOnReadySpy ).not.toBeCalled();
			expect( firstContext ).to.not.equal( secondContext );
			expect( secondContext ).to.be.an.instanceOf( ContextMock );
		} );

		it( 'should ignore the errors raised by abandoned contexts', async () => {
			const onIgnoredErrorSpy = vi.fn();
			const onErrorSpy = vi.fn();

			class BrokenContextWatchdog extends ContextWatchdog {
				public override async create() {
					throw new Error( 'Error :(' );
				}
			}

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ BrokenContextWatchdog }
					id="1"
					onError={onIgnoredErrorSpy}
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ BrokenContextWatchdog }
					id="2"
					onError={onErrorSpy}
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			await waitFor( () => {
				expect( onIgnoredErrorSpy ).not.toBeCalled();
				expect( onErrorSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	function mountAndReadReactContextValueRef(
		props: Partial<Props<any>> = {},
		children = <CKEditor editor={ MockEditor } />
	) {
		const deferContext = DeferredContextMock.create();
		const contextRef: { current: ContextWatchdogValue | null } = { current: null };

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

		const rerender = ( newProps: Partial<Props<any>> ) => {
			component?.rerender(
				<CKEditorContext
					context={ deferContext }
					contextWatchdog={ ContextWatchdog }
					watchdogConfig={ { crashNumberLimit: 678 } }
					{...props}
					{...newProps}
				>
					<ContextReader />
					{ newProps.children ?? children }
				</CKEditorContext>
			);
		};

		return {
			defer: deferContext.defer,
			wrapper: component,
			rerender,
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
			const editorRef = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ContextMock}
					contextWatchdog={ContextWatchdog}
					id="1"
				>
					<CKEditor
						ref={editorRef}
						editor={MockEditor}
						onReady={ manager.resolveOnRun() }
						onError={errorSpy}
					/>
				</CKEditorContext>
			);

			await manager.all();

			const watchdog = editorRef.current!.watchdog as any;

			watchdog._contextWatchdog._fire( 'itemError', { error, itemId: watchdog._id } );

			expect( errorSpy.mock.calls.length ).to.equal( 1 );
			expect( errorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( error );
		} );

		it( 'should execute the onError callback for proper editor', async () => {
			const firstEditorErrorSpy = vi.fn();
			const secondEditorErrorSpy = vi.fn();

			const editor1Ref = createRef<CKEditor<any>>();
			const editor2Ref = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ ContextMock }
					contextWatchdog={ ContextWatchdog }
					id="1"
				>
					<CKEditor
						ref={editor1Ref}
						editor={ MockEditor }
						onReady={ manager.resolveOnRun() }
						onError={ firstEditorErrorSpy }
					/>

					<CKEditor
						ref={editor2Ref}
						editor={ MockEditor }
						onReady={ manager.resolveOnRun() }
						onError={ secondEditorErrorSpy }
					/>
				</CKEditorContext>
			);

			await manager.all();

			// Report an error for the second editor.
			const watchdogEditor1 = editor1Ref.current!.watchdog as any;
			const watchdogEditor2 = editor2Ref.current!.watchdog as any;

			expect( watchdogEditor1._contextWatchdog ).to.be.equal( watchdogEditor2._contextWatchdog );

			watchdogEditor1._contextWatchdog._fire( 'itemError', { error, itemId: watchdogEditor1._id } );
			watchdogEditor1._contextWatchdog._fire( 'itemError', { error, itemId: watchdogEditor2._id } );

			await waitFor( () => {
				expect( firstEditorErrorSpy ).toHaveBeenCalledOnce();
				expect( secondEditorErrorSpy ).toHaveBeenCalledOnce();
				expect( secondEditorErrorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( error );
			} );
		} );
	} );
} );
