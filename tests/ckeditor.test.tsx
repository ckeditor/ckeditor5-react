/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, HTMLDivElement */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import React, { createRef, type RefObject } from 'react';
import { CKEditorError, EditorWatchdog } from 'ckeditor5';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import MockedEditor from './_utils/editor.js';
import { timeout } from './_utils/timeout.js';
import { createDefer } from './_utils/defer.js';
import { PromiseManager } from './_utils/promisemanager.js';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';
import CKEditor, { type Props } from '../src/ckeditor.js';
import { expectToBeTruthy } from './_utils/expectToBeTruthy.js';

import type { LifeCycleElementSemaphore } from '../src/lifecycle/LifeCycleElementSemaphore.js';
import type { EditorSemaphoreMountResult } from '../src/lifecycle/LifeCycleEditorSemaphore.js';

const MockEditor = MockedEditor as any;

describe( '<CKEditor> Component', () => {
	const manager: PromiseManager = new PromiseManager();
	let component: RenderResult | null = null;
	let instanceRef: RefObject<CKEditor<any>>;
	let CKEDITOR_VERSION: string;

	beforeEach( () => {
		CKEDITOR_VERSION = window.CKEDITOR_VERSION;

		component = null;
		instanceRef = createRef();

		window.CKEDITOR_VERSION = '42.0.0';
		vi.spyOn( MockEditor._model.document, 'on' );
		vi.spyOn( MockEditor._editing.view.document, 'on' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();

		component?.unmount();
		manager.clear();

		window.CKEDITOR_VERSION = CKEDITOR_VERSION;
	} );

	describe( 'initialization', async () => {
		it( 'should print a warning if the "window.CKEDITOR_VERSION" variable is not available', async () => {
			window.CKEDITOR_VERSION = '';
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			component = render(
				<CKEditor
					editor={ MockEditor }
					disabled={ true }
					onReady={ manager.resolveOnRun() }
				/>
			);

			await manager.all();

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).to.equal( 'Cannot find the "CKEDITOR_VERSION" in the "window" scope.' );
		} );

		it( 'should print a warning if using CKEditor 5 in version lower than 42', async () => {
			window.CKEDITOR_VERSION = '36.0.0';
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			component = render(
				<CKEditor
					editor={MockEditor}
					disabled={true}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub.mock.calls[ 0 ][ 0 ] ).to.equal(
				'The <CKEditor> component requires using CKEditor 5 in version 42+ or nightly build.'
			);
		} );

		it( 'should not print any warning if using CKEditor 5 in version 42 or higher', async () => {
			const warnStub = vi.spyOn( console, 'warn' );

			component = render(
				<CKEditor
					editor={MockEditor}
					disabled={true}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( warnStub ).not.toHaveBeenCalledOnce();
		} );

		it( 'calls "Editor#create()" with default configuration if not specified', async () => {
			const createSpy = vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			component = render(
				<CKEditor
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( createSpy ).toHaveBeenCalledOnce();
			expect( createSpy.mock.calls[ 0 ][ 0 ] ).to.be.an.instanceof( HTMLDivElement );
			expect( createSpy.mock.calls[ 0 ][ 1 ] ).to.have.property( 'initialData', '' );
		} );

		it( 'passes configuration object directly to the "Editor#create()" method', async () => {
			const createSpy = vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			function myPlugin() {}

			const editorConfig = {
				plugins: [
					myPlugin
				],
				toolbar: {
					items: [ 'bold' ]
				}
			};

			component = render(
				<CKEditor
					editor={MockEditor}
					config={editorConfig}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( createSpy ).toHaveBeenCalledOnce();
			expect( createSpy.mock.calls[ 0 ][ 1 ] ).to.deep.equal( {
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
			const createSpy = vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( ( createSpy.mock.calls as any )[ 0 ][ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'sets initial data if was specified (using the "config" property with the `initialData` key)', async () => {
			const createSpy = vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			component = render(
				<CKEditor
					editor={MockEditor}
					config={ { initialData: '<p>Hello CKEditor 5!</p>' } }
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( ( createSpy.mock.calls as any )[ 0 ][ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'shows a warning if used "data" and "config.initialData" at the same time', async () => {
			const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Foo</p>"
					config={{ initialData: '<p>Foo</p>' }}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).to.equal(
				'Editor data should be provided either using `config.initialData` or `content` property. ' +
				'The config value takes precedence over `content` property and will be used when both are specified.'
			);
		} );

		it( 'uses "config.initialData" over "data" when specified both', async () => {
			const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const createSpy = vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Foo</p>"
					config={{ initialData: '<p>Bar</p>' }}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( ( createSpy.mock.calls as any )[ 0 ][ 1 ].initialData ).to.equal( '<p>Bar</p>' );
		} );

		it( 'when setting initial data, it must not use "Editor.setData()"', async () => {
			const editorInstance = new MockEditor();

			vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );
			const setDataSpy = vi.spyOn( editorInstance, 'setData' );

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( setDataSpy ).not.toHaveBeenCalled();
		} );

		it( 'must not update the component by React itself', async () => {
			vi.spyOn( MockEditor, 'create' ).mockResolvedValue( new MockEditor() );

			component = render(
				<CKEditor
					ref={instanceRef}
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expectToBeTruthy( instanceRef.current );
			expect( instanceRef.current.shouldComponentUpdate( {
				editor: MockEditor,
				data: '<p>Hello CKEditor 5!</p>'
			} ) ).to.equal( false );
		} );

		it( 'displays an error if something went wrong and "onError" callback was not specified', async () => {
			const error = new Error( 'Something went wrong.' );
			const consoleErrorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			vi.spyOn( MockEditor, 'create' ).mockRejectedValue( error );

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
				/>
			);

			await new Promise( res => setTimeout( res ) );

			expect( consoleErrorStub ).toHaveBeenCalledOnce();
			expect( consoleErrorStub.mock.calls[ 0 ][ 0 ] ).to.equal( error );
			expect( consoleErrorStub.mock.calls[ 0 ][ 1 ].phase ).to.equal( 'initialization' );
			expect( consoleErrorStub.mock.calls[ 0 ][ 1 ].willEditorRestart ).to.equal( false );
		} );

		it( 'passes the specified editor class to the watchdog feature', async () => {
			const constructorSpy = vi.fn();

			class CustomEditorWatchdog extends EditorWatchdog {
				constructor( ...args: ConstructorParameters<typeof EditorWatchdog> ) {
					super( ...args );
					constructorSpy( ...args );
				}
			}

			MockEditor.EditorWatchdog = CustomEditorWatchdog;

			component = render(
				<CKEditor
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( constructorSpy ).toHaveBeenCalled();
			expect( constructorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( MockEditor );

			MockEditor.EditorWatchdog = EditorWatchdog;
		} );

		it( 'passes the watchdog config to the watchdog feature', async () => {
			const constructorSpy = vi.fn();
			const myWatchdogConfig = { crashNumberLimit: 678 };

			class CustomEditorWatchdog extends EditorWatchdog {
				constructor( ...args: ConstructorParameters<typeof EditorWatchdog> ) {
					super( ...args );
					constructorSpy( ...args );
				}
			}

			MockEditor.EditorWatchdog = CustomEditorWatchdog;

			component = render(
				<CKEditor
					editor={MockEditor}
					watchdogConfig={myWatchdogConfig}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( constructorSpy ).toHaveBeenCalled();
			expect( constructorSpy.mock.calls[ 0 ][ 1 ] ).to.deep.equal( myWatchdogConfig );

			MockEditor.EditorWatchdog = EditorWatchdog;
		} );
	} );

	describe( 'properties', () => {
		// See: #83.
		it( 'does not update anything if component is not ready', async () => {
			const editorInstance = new MockEditor();

			vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

			component = render(
				<CKEditor
					ref={instanceRef}
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			expect( () => {
				expectToBeTruthy( instanceRef.current );
				expect( instanceRef.current.shouldComponentUpdate( {
					editor: MockEditor,
					disabled: true
				} ) ).to.be.false;
			} ).to.not.throw();
		} );

		describe( '#onReady', () => {
			it( 'calls "onReady" callback if specified when the editor is ready to use', async () => {
				let editor;
				const editorInstance = new MockEditor();
				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onReady={manager.resolveOnRun( resolvedEditor => {
							editor = resolvedEditor;
						} )}
					/>
				);

				await manager.all();

				expect( editor ).to.equal( editorInstance );
			} );
		} );

		describe( '#onChange', () => {
			it( 'executes "onChange" callback if it was specified and the editor\'s data has changed', async () => {
				const onChange = vi.fn();
				const editorInstance = new MockEditor();
				const onDocumentSpy = vi.spyOn( MockEditor._model.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onChange={onChange}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const fireChanges = onDocumentSpy.mock.calls[ 0 ][ 1 ] as any;
				const event = { name: 'change:data' };

				fireChanges( event );

				expect( onChange ).toHaveBeenCalledOnce();
				expect( onChange.mock.calls[ 0 ][ 0 ] ).to.equal( event );
				expect( onChange.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onChange" callback if it is available in runtime when the editor\'s data has changed', async () => {
				const onChange = vi.fn();
				const editorInstance = new MockEditor();
				const onDocumentSpy = vi.spyOn( MockEditor._model.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onChange={onChange}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const fireChanges = onDocumentSpy.mock.calls[ 0 ][ 1 ] as Function;
				const event = { name: 'change:data' };

				fireChanges( event );

				expect( onChange ).toHaveBeenCalled();
				expect( onChange.mock.calls[ 0 ][ 0 ] ).to.equal( event );
				expect( onChange.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onFocus', () => {
			it( 'listens to the "viewDocument#focus" event in order to call "onFocus" callback', async () => {
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );
				vi.spyOn( editorInstance, 'getData' ).mockReturnValue( '<p>Foo.</p>' );

				component = render(
					<CKEditor
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				// More events are being attached to `viewDocument`.
				expect( viewDocumentSpy ).toHaveBeenCalledTimes( 2 );
				expect( viewDocumentSpy.mock.calls[ 0 ][ 0 ] ).to.equal( 'focus' );
				expect( viewDocumentSpy.mock.calls[ 0 ][ 1 ] ).to.be.a( 'function' );
			} );

			it( 'executes "onFocus" callback if it was specified and the editor was focused', async () => {
				const event = { name: 'focus' };
				const onFocus = vi.fn();
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onFocus={onFocus}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const fireChanges = viewDocumentSpy.mock.calls[ 0 ][ 1 ] as Function;

				fireChanges( event );

				expect( onFocus ).toHaveBeenCalledOnce();
				expect( onFocus.mock.calls[ 0 ][ 0 ] ).to.equal( event );
				expect( onFocus.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onFocus" callback if it is available in runtime when the editor was focused', async () => {
				const onFocus = vi.fn();
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				component.rerender(
					<CKEditor
						editor={MockEditor}
						onFocus={onFocus}
					/>
				);

				const fireChanges = viewDocumentSpy.mock.calls[ 0 ][ 1 ] as Function;

				fireChanges( { name: 'focus' } );

				expect( onFocus ).toHaveBeenCalledOnce();
				expect( onFocus.mock.calls[ 0 ][ 0 ] ).to.deep.equal( { name: 'focus' } );
				expect( onFocus.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onBlur', () => {
			it( 'listens to the "viewDocument#blur" event in order to call "onBlur" callback', async () => {
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );
				vi.spyOn( editorInstance, 'getData' ).mockReturnValue( '<p>Foo.</p>' );

				component = render(
					<CKEditor
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				// More events are being attached to `viewDocument`.
				expect( viewDocumentSpy ).toHaveBeenCalledTimes( 2 );
				expect( viewDocumentSpy.mock.calls[ 1 ][ 0 ] ).to.equal( 'blur' );
				expect( viewDocumentSpy.mock.calls[ 1 ][ 1 ] ).to.be.a( 'function' );
			} );

			it( 'executes "onBlur" callback if it was specified and the editor was blurred', async () => {
				const event = { name: 'blur' };
				const onBlur = vi.fn();
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onBlur={onBlur}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const fireChanges = viewDocumentSpy.mock.calls[ 1 ][ 1 ] as Function;

				fireChanges( event );

				expect( onBlur ).toHaveBeenCalledOnce();
				expect( onBlur.mock.calls[ 0 ][ 0 ] ).to.equal( event );
				expect( onBlur.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );

			it( 'executes "onBlur" callback if it is available in runtime when the editor was blurred', async () => {
				const event = { name: 'blur' };
				const onBlur = vi.fn();
				const editorInstance = new MockEditor();
				const viewDocumentSpy = vi.spyOn( MockEditor._editing.view.document, 'on' );

				vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

				component = render(
					<CKEditor
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				component?.rerender(
					<CKEditor
						editor={MockEditor}
						onBlur={onBlur}
					/>
				);

				const fireChanges = viewDocumentSpy.mock.calls[ 1 ][ 1 ] as Function;

				fireChanges( event );

				expect( onBlur ).toHaveBeenCalledOnce();
				expect( onBlur.mock.calls[ 0 ][ 0 ] ).to.equal( event );
				expect( onBlur.mock.calls[ 0 ][ 1 ] ).to.equal( editorInstance );
			} );
		} );

		describe( '#onError', () => {
			it( 'calls the callback if specified when an error occurs', async () => {
				let error;
				let details;
				const originalError = new Error( 'Error was thrown.' );

				vi.spyOn( MockEditor, 'create' ).mockRejectedValue( originalError );

				component = render(
					<CKEditor
						editor={MockEditor}
						onError={( err, dets ) => {
							error = err;
							details = dets;
						}}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expect( error ).to.equal( error );
				expect( details.phase ).to.equal( 'initialization' );
				expect( details.willEditorRestart ).to.equal( false );
			} );

			it( 'calls the callback if the runtime error occurs', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const onErrorSpy = vi.fn();

				component.rerender(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						onError={onErrorSpy}
					/>
				);

				expect( instanceRef.current ).to.be.toBeTruthy();

				const error = new CKEditorError( 'foo', instanceRef.current!.editor );
				const semaphore = (
					instanceRef.current as any
				).editorSemaphore as LifeCycleElementSemaphore<EditorSemaphoreMountResult<any>>;

				( semaphore.value?.watchdog as any )._handleError( error );

				expect( onErrorSpy ).toHaveBeenCalledOnce();
				expect( onErrorSpy.mock.calls[ 0 ][ 0 ] ).to.equal( error );
				expect( onErrorSpy.mock.calls[ 0 ][ 1 ].phase ).to.equal( 'runtime' );
				expect( onErrorSpy.mock.calls[ 0 ][ 1 ].willEditorRestart ).to.equal( true );
			} );
		} );

		describe( '#disabled', () => {
			it( 'switches the editor to read-only mode if [disabled={true}]', async () => {
				let editor: typeof MockEditor;

				component = render(
					<CKEditor
						editor={MockEditor}
						disabled={true}
						onReady={manager.resolveOnRun( instance => {
							editor = instance;
						} )}
					/>
				);

				await manager.all();

				expect( editor.isReadOnly ).to.be.true;
			} );

			it( 'switches the editor to read-only mode when [disabled={true}] property was set in runtime', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				component.rerender(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						disabled
					/>
				);

				await waitFor( () => {
					expectToBeTruthy( instanceRef.current?.editor );
					expect( instanceRef.current.editor.isReadOnly ).to.be.true;
				} );
			} );

			it( 'disables the read-only mode when [disabled={false}] property was set in runtime', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						disabled={true}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expect( instanceRef.current!.editor?.isReadOnly ).to.be.true;

				component.rerender(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						disabled={false}
					/>
				);

				await waitFor( () => {
					expect( instanceRef.current!.editor?.isReadOnly ).to.be.false;
				} );
			} );
		} );

		describe( '#id', () => {
			it( 'should re-mount the editor if the attribute has changed', async () => {
				let editor;
				const editorCreate = vi
					.spyOn( MockEditor, 'create' )
					.mockImplementation( async () => new MockEditor() );

				component = render(
					<CKEditor
						editor={MockEditor}
						config={ { initialData: '<p>foo</p>' } }
						id="1"
						onReady={manager.resolveOnRun( resolvedEditor => {
							editor = resolvedEditor;
						} )}
					/>
				);

				await manager.all();

				expect( editorCreate ).toHaveBeenCalledOnce();
				expect( ( editorCreate.mock.calls as any )[ 0 ][ 1 ].initialData ).to.equal( '<p>foo</p>' );

				let editor2;

				component.rerender(
					<CKEditor
						editor={MockEditor}
						config={ { initialData: '<p>bar</p>' } }
						id="2"
						onReady={manager.resolveOnRun( resolvedEditor => {
							editor2 = resolvedEditor;
						} )}
					/>
				);

				await manager.all();

				expect( editorCreate ).toHaveBeenCalledTimes( 2 );
				expect( ( editorCreate.mock.calls as any )[ 1 ][ 1 ].initialData ).to.equal( '<p>bar</p>' );
				expect( editor ).to.not.equal( editor2 );
			} );

			it( 'should not re-mount the editor if the attribute has not changed', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const editorCreate = vi
					.spyOn( MockEditor, 'create' )
					.mockImplementation( async () => new MockEditor() );

				component.rerender(
					<CKEditor
						editor={MockEditor}
						config={ { initialData: '<p>bar</p>' } }
						id="1"
					/>
				);

				await new Promise( res => setTimeout( res ) );

				expect( editorCreate ).not.toHaveBeenCalled();
			} );

			it( 'should destroy the old watchdog instance while re-mounting the editor', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expectToBeTruthy( instanceRef.current );

				const { watchdog: firstWatchdog } = instanceRef.current;

				component?.rerender(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>bar</p>' }}
						id="2"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expectToBeTruthy( instanceRef.current );
				expectToBeTruthy( firstWatchdog );

				const { watchdog: secondWatchdog } = instanceRef.current;

				expectToBeTruthy( secondWatchdog );
				expect( firstWatchdog ).to.not.equal( secondWatchdog );
				expect( ( firstWatchdog as EditorWatchdog ).state ).to.equal( 'destroyed' );
				expect( ( secondWatchdog as EditorWatchdog ).state ).to.equal( 'ready' );
			} );
		} );

		describe( '#disableWatchdog', () => {
			it( 'should not initialize watchdog if disableWatchdog is set to true', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						disableWatchdog={true}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expectToBeTruthy( instanceRef.current );
				expect( instanceRef.current.watchdog ).to.be.null;
			} );

			it( 'should initialize watchdog if disableWatchdog is set to false', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						disableWatchdog={false}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expectToBeTruthy( instanceRef.current );
				expect( instanceRef.current.watchdog ).not.to.be.null;
			} );

			it( 'should initialize watchdog if disableWatchdog is not set', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expectToBeTruthy( instanceRef.current );
				expect( instanceRef.current.watchdog ).not.to.be.null;
			} );

			it( 'should re-render when disableWatchdog has changed', async () => {
				component = render(
					<CKEditor
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expect( instanceRef.current?.watchdog ).not.to.be.null;

				component?.rerender(
					<CKEditor
						disableWatchdog
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expect( instanceRef.current?.watchdog ).to.be.null;

				component?.rerender(
					<CKEditor
						disableWatchdog={false}
						ref={instanceRef}
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);
				await manager.all();

				expect( instanceRef.current?.watchdog ).not.to.be.null;
			} );
		} );
	} );

	describe( 'destroy', () => {
		it( 'calls "Editor#destroy()" method during unmounting the component', async () => {
			const editorInstance = new MockEditor();

			vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );

			const destroySpy = vi.spyOn( editorInstance, 'destroy' );

			component = render(
				<CKEditor
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			await new Promise<void>( res => {
				destroySpy.mockImplementation( () => {
					res();

					return Promise.resolve();
				} );

				component!.unmount();
			} );

			component = null;

			expect( destroySpy ).toHaveBeenCalledOnce();
		} );

		it( 'should set to "null" the "editor" property inside the component', async () => {
			const editorInstance = new MockEditor();

			vi.spyOn( MockEditor, 'create' ).mockResolvedValue( editorInstance );
			component = render(
				<CKEditor
					ref={instanceRef}
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			const instance = instanceRef.current;

			expect( instance?.editor ).is.not.null;

			component.unmount();
			component = null;

			// Wait a cycle.
			await waitFor( () => {
				expect( instance?.editor ).is.null;
			} );
		} );
	} );

	describe( 'in case of error handling', () => {
		it( 'should restart the editor if a runtime error occurs', async () => {
			vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			const onAfterDestroySpy = vi.fn();

			component = render(
				<CKEditor
					ref={instanceRef}
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
					onAfterDestroy={onAfterDestroySpy}
				/>
			);

			await manager.all();

			const firstEditor = instanceRef.current?.editor;

			expect( firstEditor ).to.be.instanceOf( MockEditor );

			await turnOffDefaultErrorCatching( () => {
				return new Promise( res => {
					component?.rerender(
						<CKEditor
							ref={instanceRef}
							editor={MockEditor}
							onReady={res}
							onAfterDestroy={onAfterDestroySpy}
						/>
					);

					setTimeout( () => {
						throw new CKEditorError( 'foo', firstEditor );
					} );
				} );
			} );

			await waitFor( () => {
				const { editor } = instanceRef.current!;

				expect( editor ).to.be.instanceOf( MockEditor );
				expect( firstEditor ).to.not.equal( editor );
				expect( onAfterDestroySpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'semaphores', () => {
		const testSemaphoreForWatchdog = () => {
			it( 'should assign properly `data` property to editor even if it is still mounting', async () => {
				const deferInitialization = createDefer();

				class SlowEditor extends MockEditor {
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

					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						await deferInitialization.promise;

						return new SlowEditor( ...args );
					}
				}

				const MockSlowEditor = SlowEditor as any;
				let editor: any = null;

				const component = render(
					<CKEditor
						editor={MockSlowEditor}
						config={{
							initialData: '1'
						}}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
				);

				await timeout( 100 );

				component.rerender(
					<CKEditor
						data='Hello World'
						editor={MockSlowEditor}
						config={{
							initialData: '1'
						}}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
				);

				deferInitialization.resolve();

				await waitFor( () => {
					expect( editor ).not.to.be.null;
					expect( editor.data.get() ).to.be.equal( 'Hello World' );
				} );
			} );

			it( 'should set data in sync mode when editor is already mounted', async () => {
				class SlowEditor extends MockEditor {
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

					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						return new SlowEditor( ...args );
					}
				}

				const MockSlowEditor = SlowEditor as any;
				let editor: any = null;

				const component = render(
					<CKEditor
						editor={MockSlowEditor}
						config={{
							initialData: '1'
						}}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
				);

				component.rerender(
					<CKEditor
						data='Hello World'
						editor={MockSlowEditor}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
				);

				await waitFor( () => {
					expect( editor ).not.to.be.null;
					expect( editor.data.get() ).to.be.equal( 'Hello World' );
				} );
			} );

			it( 'should buffer many rerenders while creating editor', async () => {
				const initializerLog: Array<any> = [];

				class SlowEditor extends MockEditor {
					public static async create( ...args: ConstructorParameters<typeof SlowEditor> ) {
						await timeout( 300 );

						return new SlowEditor( ...args );
					}
				}

				const MockSlowEditor = SlowEditor as any;
				const createEditorElement = ( props: Partial<Props<any>> = {} ) => (
					<CKEditor
						editor={MockSlowEditor}
						config={{
							initialData: '1',
							key: 1,
							abc: 123
						} as any}
						onReady={resolvedEditor => {
							initializerLog.push( {
								status: 'ready',
								id: resolvedEditor.config.key
							} );
						}}
						onAfterDestroy={destroyedEditor => {
							initializerLog.push( {
								status: 'destroy',
								id: destroyedEditor.config.key
							} );
						}}
						{...props}
					/>
				);

				const component = render( createEditorElement() );

				component?.rerender(
					createEditorElement( {
						id: 111,
						config: {
							key: 2
						} as any
					} )
				);

				await timeout( 50 );

				component?.rerender(
					createEditorElement( {
						id: 112,
						config: {
							key: 3
						} as any
					} )
				);

				await timeout( 50 );

				component?.rerender(
					createEditorElement( {
						id: 113,
						config: {
							key: 4
						} as any
					} )
				);

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
			describe( `watchdog=${ enableWatchdog }`, testSemaphoreForWatchdog );
		}
	} );
} );

