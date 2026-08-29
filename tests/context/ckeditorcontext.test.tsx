/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, afterEach, it, expect, vi } from 'vitest';
import React, { createRef, StrictMode } from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import CKEditorContext, {
	useCKEditorContextValue,
	type Props,
	type CKEditorContextValue
} from '../../src/context/ckeditorcontext.js';

import CKEditor from '../../src/ckeditor.js';
import MockedEditor from '../_utils/editor.js';
import { ClassicEditor, CKEditorError } from 'ckeditor5';
import ContextMock, { DeferredContextMock } from '../_utils/context.js';
import { timeout } from '../_utils/timeout.js';
import { PromiseManager } from '../_utils/promisemanager.js';
import { turnOffErrors } from '../_utils/turnOffErrors.js';

const MockEditor = MockedEditor as any;

describe( '<CKEditorContext> Component', () => {
	const manager: PromiseManager = new PromiseManager();
	let component: RenderResult | null = null;

	afterEach( () => {
		component?.unmount();
		manager.clear();
	} );

	describe( 'initialization', () => {
		it( 'should be initialized with the context instance', async () => {
			const { contextRef, defer } = mountAndReadReactContextValueRef();

			expect( contextRef.current ).to.be.deep.equal( {
				status: 'initializing'
			} );

			defer.resolve();

			await waitFor( () => {
				const { current } = contextRef;

				expect( current ).to.have.property( 'context' );
				expect( current!.status ).to.be.equal( 'initialized' );

				if ( current?.status === 'initialized' ) {
					expect( current.context ).to.be.an.instanceOf( ContextMock );
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

				expect( current ).to.have.property( 'context' );
				expect( current!.status ).to.be.equal( 'initialized' );

				if ( current?.status === 'initialized' ) {
					expect( current.context ).to.be.an.instanceOf( ContextMock );
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
				<CKEditorContext context={ ContextMock } >
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
				<CKEditorContext context={ContextMock} >
					<CKEditor ref={editorRef} editor={MockEditor} onReady={ manager.resolveOnRun() } />
				</CKEditorContext>
			);

			await manager.all();

			expect( editorRef.current!.editor ).to.be.a( 'object' );
			expect( editorCreateSpy ).toHaveBeenCalledOnce();

			const firstCall = editorCreateSpy.mock.calls[ 0 ];

			// <= v47 versions of the editor use the second parameter to pass config.
			expect( firstCall[ 1 ] ?? firstCall[ 0 ] ).to.have.property( 'context' );
		} );

		it( 'should initialize its inner editors correctly', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const editor1Ref = createRef<CKEditor<any>>();
			const editor2Ref = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ ContextMock }
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

			const pickConfigEntry = ( callArgs: any ) => callArgs[ 1 ] ?? callArgs[ 0 ];
			const pickInitialData = ( config: any ) => config.initialData ?? config.roots?.main?.initialData;

			expect( pickInitialData( pickConfigEntry( calls[ 0 ] ) ) ).to.equal( '<p>Foo</p>' );
			expect( pickInitialData( pickConfigEntry( calls[ 1 ] ) ) ).to.equal( '<p>Bar</p>' );

			expect( pickConfigEntry( calls[ 0 ] ).context ).to.be.instanceOf( ContextMock );
			expect( pickConfigEntry( calls[ 1 ] ).context ).to.be.instanceOf( ContextMock );
			expect( pickConfigEntry( calls[ 0 ] ).context ).to.equal( ( calls[ 1 ][ 1 ] ?? calls[ 1 ][ 0 ] ).context );
		} );

		it( 'should destroy the context when the component is unmounted', async () => {
			let destroySpy: any = null;

			component = render(
				<CKEditorContext
					context={ ContextMock }
					onReady={ manager.resolveOnRun( ( instance: any ) => {
						destroySpy = vi.spyOn( instance, 'destroy' );
					} ) }
				/>
			);

			await manager.all();

			component.unmount();
			component = null;

			await waitFor( () => {
				expect( destroySpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'properties', () => {
		describe( '#onError', () => {
			it( 'should be called when an initialization error occurs', async () => {
				let errorEvent;
				const error = new Error();

				vi.spyOn( ContextMock, 'create' ).mockRejectedValue( error );

				component = render(
					<CKEditorContext
						context={ ContextMock }
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
					phase: 'initialization'
				} );
			} );

			it( 'should be called when a runtime error occurs', async () => {
				const onErrorSpy = vi.fn();
				let context: any = null;

				// A real context, because reporting attributes errors to contexts it knows about.
				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						onError={ onErrorSpy }
						onReady={ manager.resolveOnRun( ( instance: any ) => {
							context = instance;
						} ) }
					/>
				);

				await manager.all();

				await turnOffErrors( async () => {
					const error = new CKEditorError( 'foo', context );

					setTimeout( () => {
						throw error;
					} );
				} );

				await waitFor( () => {
					expect( onErrorSpy ).toHaveBeenCalledOnce();
				} );

				const errorEventArgs = onErrorSpy.mock.calls[ 0 ];

				expect( errorEventArgs[ 0 ] ).to.instanceOf( Error );
				expect( errorEventArgs[ 1 ] ).to.deep.equal( {
					phase: 'runtime'
				} );
			} );

			// Reporting is one registration for the whole page and every component listens to it, so what keeps
			// an error with the editor it came from is the filter each of them applies. Sharing a context must
			// not make two editors answer for each other, and the context must stay out of what an editor owns.
			it( 'should call onError of the editor the error came from, and of nothing else', async () => {
				const firstSpy = vi.fn();
				const secondSpy = vi.fn();
				const contextSpy = vi.fn();
				const editors: Record<string, any> = {};

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
						onError={ contextSpy }
						onChangeInitializedEditors={ initialized => Object.assign( editors, initialized ) }
					>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ { name: 'first' } }
							onError={ firstSpy }
						/>
						<CKEditor
							editor={ ClassicEditor }
							contextItemMetadata={ { name: 'second' } }
							onError={ secondSpy }
						/>
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( editors.first ).to.not.be.undefined;
					expect( editors.second ).to.not.be.undefined;
				} );

				const error = new CKEditorError( 'foo', editors.second.instance );

				await turnOffErrors( async () => {
					setTimeout( () => {
						throw error;
					} );
				} );

				await waitFor( () => {
					expect( secondSpy ).toHaveBeenCalledOnce();
				} );

				expect( secondSpy ).toHaveBeenCalledWith( error, { phase: 'runtime' } );
				expect( firstSpy ).not.toHaveBeenCalled();
				expect( contextSpy ).not.toHaveBeenCalled();
			} );

			it( 'displays an error if something went wrong and "onError" callback was not specified', async () => {
				const error = new Error( 'Something went wrong.' );
				const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				const contextRef: { current: CKEditorContextValue | null } = { current: null };

				const ContextReader = () => {
					contextRef.current = useCKEditorContextValue();
					return null;
				};

				// The component creates from the class it is given, so that is where the rejection has to sit.
				vi.spyOn( ContextMock, 'create' ).mockRejectedValue( error );

				component = render(
					<CKEditorContext context={ ContextMock }>
						<ContextReader />
					</CKEditorContext>
				);

				await waitFor( () => {
					const { current } = contextRef;

					expect( consoleErrorStub ).toHaveBeenCalledOnce();

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
						onReady={ manager.resolveOnRun() }
					>
						<CKEditor editor={ MockEditor } onReady={ editorReadySpy } config={ { initialData: '<p>Foo</p>' } } />
						<CKEditor editor={ MockEditor } onReady={ editorReadySpy } config={ { initialData: '<p>Bar</p>' } } />
					</CKEditorContext>
				);

				await manager.all();

				// Wait until `onReady()` callbacks have been executed.
				await new Promise( res => setTimeout( res, 1 ) );

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
						onChangeInitializedEditors={ onChangeInitializedEditorsSpy }
					>
						<CKEditor editor={ ClassicEditor } />
					</CKEditorContext>
				);

				await waitFor( () => {
					expect( onChangeInitializedEditorsSpy ).toHaveBeenCalledOnce();

					const [ editors, context ] = onChangeInitializedEditorsSpy.mock.lastCall!;
					const [ editorId ] = Object.keys( editors );

					// Ensure that the editor UUID is returned.
					expect( editorId ).to.have.length( 33 );
					expect( editors[ editorId ].instance ).to.be.instanceOf( ClassicEditor );

					// The second argument is the context the editors run in.
					expect( context ).to.be.instanceOf( ClassicEditor.Context );
				} );
			} );

			it( 'should use editorName property passed to the CKEditor component as key in the editors map', async () => {
				const onChangeInitializedEditorsSpy = vi.fn();

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
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
					// The map shrinks when editors are destroyed too, so assert only while the editor is in it.
					if ( editors.editor1 ) {
						expect( editors.editor1.instance.state ).to.be.equal( 'ready' );
					}
				} );

				component = render(
					<CKEditorContext
						context={ ClassicEditor.Context }
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

		it( 'should not create the editor if layout is not ready', async () => {
			const editorRef = createRef<CKEditor<any>>();

			component = render(
				<CKEditorContext
					context={ ContextMock }
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

			expect( editorRef.current!.editor ).to.equal( null );

			component.rerender(
				<CKEditorContext
					context={ ContextMock }
					id="1"
				>
					<CKEditor
						ref={editorRef}
						editor={ MockEditor }
					/>
				</CKEditorContext>
			);

			await waitFor( () => {
				expect( editorRef.current!.editor ).to.not.equal( null );
			} );
		} );

		it( 'should restart the Context and all editors if children has changed', async () => {
			const editorCreateSpy = vi.spyOn( MockEditor, 'create' );
			const { waitForInitialize, rerender } = mountAndReadReactContextValueRef(
				{},
				<CKEditor editor={ MockEditor } config={{ initialData: 'Hello World' }} />
			);

			await waitForInitialize();

			const editorCreateCalls = editorCreateSpy.mock.calls as any;
			const pickInitialDataFromCallArgs = ( callArgs: any ) => callArgs[ 1 ]?.initialData ?? callArgs[ 0 ].roots?.main?.initialData;

			// <= 47 version of editor uses two parameters initialization syntax
			expect( pickInitialDataFromCallArgs( editorCreateCalls[ 0 ] ) ).to.equal( 'Hello World' );

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
				expect( pickInitialDataFromCallArgs( editorCreateCalls[ 1 ] ) ).to.equal( 'Foo' );
				expect( pickInitialDataFromCallArgs( editorCreateCalls[ 2 ] ) ).to.equal( 'Bar' );
			} );
		} );
	} );

	describe( 'fast re-initialization of multiroot editor', () => {
		it( 'should reinitialize the context when it changes', async () => {
			let firstContext: ContextMock | null = null;
			let secondContext: ContextMock | null = null;

			component = render(
				<CKEditorContext
					context={ ContextMock }
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

			class BrokenContextMock extends ContextMock {
				public static override create(): Promise<any> {
					return Promise.reject( new Error( 'Error :(' ) );
				}
			}

			component = render(
				<CKEditorContext
					context={ BrokenContextMock }
					id="1"
					onError={onIgnoredErrorSpy}
				>
					<CKEditor editor={ MockEditor } />
				</CKEditorContext>
			);

			component.rerender(
				<CKEditorContext
					context={ BrokenContextMock }
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
		const contextRef: { current: CKEditorContextValue | null } = { current: null };

		const ContextReader = () => {
			contextRef.current = useCKEditorContextValue();
			return null;
		};

		component = render(
			<CKEditorContext
				context={ deferContext }
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
