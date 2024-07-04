/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, HTMLDivElement, document */

import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import React from 'react';
import { CKEditorError, EditorWatchdog } from 'ckeditor5';
import { render, type RenderResult } from '@testing-library/react';
import MockedEditor from './_utils/editor.js';
import { timeout } from './_utils/timeout.js';
import { waitFor } from './_utils/waitFor.js';
import { createDefer } from './_utils/defer.js';
import { PromiseManager } from './_utils/render.js';
import turnOffDefaultErrorCatching from './_utils/turnoffdefaulterrorcatching.js';
import CKEditor from '../src/ckeditor.js';

declare global {
	interface Window {
		CKEDITOR_VERSION: any;
	}
}

const MockEditor = MockedEditor as any;

describe( '<CKEditor> Component', () => {
	const manager: PromiseManager = new PromiseManager();
	let component: RenderResult | null = null;
	let CKEDITOR_VERSION: string;

	beforeEach( () => {
		CKEDITOR_VERSION = window.CKEDITOR_VERSION;

		component = null;
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
			delete window.CKEDITOR_VERSION;
			const warnStub = vi.spyOn( console, 'warn' );

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
			const warnStub = vi.spyOn( console, 'warn' );

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

			expect( createSpy.mock.calls[ 0 ][ 1 ].initialData ).to.equal(
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

			expect( createSpy.mock.calls[ 0 ][ 1 ].initialData ).to.equal(
				'<p>Hello CKEditor 5!</p>'
			);
		} );

		it( 'shows a warning if used "data" and "config.initialData" at the same time', async () => {
			const consoleWarnStub = vi.spyOn( console, 'warn' );

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

			expect( createSpy.mock.calls[ 0 ][ 1 ].initialData ).to.equal( '<p>Bar</p>' );
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
					editor={MockEditor}
					data="<p>Hello CKEditor 5!</p>"
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			const instance = component.instance();

			// This method always is called with an object with component's properties.
			expect( instance.shouldComponentUpdate( {} ) ).to.equal( false );
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
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			const instance = component.instance();
			let shouldComponentUpdate;

			expect( () => {
				shouldComponentUpdate = instance.shouldComponentUpdate( { disabled: true } );
			} ).to.not.throw();

			expect( shouldComponentUpdate ).to.be.false;
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

				const fireChanges = onDocumentSpy.mock.calls[ 0 ][ 1 ];
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

				const fireChanges = viewDocumentSpy.mock.calls[ 0 ][ 1 ];

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

				component!.setProps( { onFocus } );

				const fireChanges = viewDocumentSpy.mock.calls[ 0 ][ 1 ];

				fireChanges( { name: 'focus' } );

				expect( onFocus ).toHaveBeenCalledOnce();
				expect( onFocus.mock.calls[ 0 ][ 0 ] ).to.equal( { name: 'focus' } );
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

				const fireChanges = viewDocumentSpy.mock.calls[ 1 ][ 1 ];

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

				component!.setProps( { onBlur } );

				const fireChanges = viewDocumentSpy.mock.calls[ 1 ][ 1 ];

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
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const error = new CKEditorError( 'foo', component!.instance().editor );

				const onErrorSpy = vi.fn();
				component!.setProps( { onError: onErrorSpy } );

				await turnOffDefaultErrorCatching( () => {
					return new Promise( res => {
						component!.setProps( { onReady: res } );

						setTimeout( () => {
							throw error;
						} );
					} );
				} );

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
						editor={MockEditor}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				component!.setProps( { disabled: true } );

				expect( component!.instance().editor.isReadOnly ).to.be.true;
			} );

			it( 'disables the read-only mode when [disabled={false}] property was set in runtime', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						disabled={true}
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				expect( component!.instance().editor.isReadOnly ).to.be.true;

				component!.setProps( { disabled: false } );

				expect( component!.instance().editor.isReadOnly ).to.be.false;
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
				expect( editorCreate.mock.calls[ 0 ][ 1 ].initialData ).to.equal( '<p>foo</p>' );

				const editor2 = await new Promise( res => {
					component!.setProps( { onReady: res, id: '2', config: { initialData: '<p>bar</p>' } } );
				} );

				expect( editorCreate ).toHaveBeenCalledTimes( 2 );
				expect( editorCreate.mock.calls[ 1 ][ 1 ].initialData ).to.equal( '<p>bar</p>' );
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

				component!.setProps( { id: '1', config: { initialData: '<p>bar</p>' } } );

				await new Promise( res => setTimeout( res ) );

				expect( editorCreate ).not.toHaveBeenCalled();
			} );

			it( 'should destroy the old watchdog instance while re-mounting the editor', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const { watchdog: firstWatchdog } = component!.instance();

				await new Promise( res => {
					component!.setProps( { onReady: res, id: '2', config: { initialData: '<p>bar</p>' } } );
				} );

				const { watchdog: secondWatchdog } = component!.instance();

				expect( firstWatchdog ).to.not.equal( secondWatchdog );
				expect( firstWatchdog.state ).to.equal( 'destroyed' );
				expect( secondWatchdog.state ).to.equal( 'ready' );
			} );
		} );

		describe( '#disableWatchdog', () => {
			it( 'should not initialize watchdog if disableWatchdog is set to true', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						disableWatchdog={true}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const { watchdog } = component.instance();

				expect( watchdog ).to.equal( null );
			} );

			it( 'should initialize watchdog if disableWatchdog is set to false', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						disableWatchdog={false}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const { watchdog } = component.instance();

				expect( watchdog ).not.to.equal( null );
			} );

			it( 'should initialize watchdog if disableWatchdog is not set', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const { watchdog } = component.instance();

				expect( watchdog ).not.to.equal( null );
			} );

			it( 'should re-render when disableWatchdog has changed', async () => {
				component = render(
					<CKEditor
						editor={MockEditor}
						config={{ initialData: '<p>foo</p>' }}
						id="1"
						onReady={manager.resolveOnRun()}
					/>
				);

				await manager.all();

				const { watchdog: watchdog1 } = component.instance();
				expect( watchdog1 ).not.to.equal( null );

				await new Promise( res => {
					component.setProps( { onReady: res, disableWatchdog: true } );
				} );

				const { watchdog: watchdog2 } = component.instance();
				expect( watchdog2 ).to.equal( null );

				await new Promise( res => {
					component.setProps( { onReady: res, disableWatchdog: false } );
				} );

				const { watchdog: watchdog3 } = component.instance();
				expect( watchdog3 ).not.to.equal( null );
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
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			const instance = component.instance();

			expect( instance.editor ).is.not.null;

			instance.unmount();
			component = null;

			// Wait a cycle.
			await waitFor( () => {
				expect( instance.editor ).is.null;
			} );
		} );
	} );

	describe( 'in case of error handling', () => {
		it( 'should restart the editor if a runtime error occurs', async () => {
			component = render(
				<CKEditor
					editor={MockEditor}
					onReady={manager.resolveOnRun()}
				/>
			);

			await manager.all();

			const firstEditor = component.instance().editor;

			expect( firstEditor ).to.be.instanceOf( MockEditor );

			await turnOffDefaultErrorCatching( () => {
				return new Promise( res => {
					component.setProps( { onReady: res } );

					setTimeout( () => {
						throw new CKEditorError( 'foo', firstEditor );
					} );
				} );
			} );

			await waitFor( () => {
				const { editor } = component.instance();

				expect( editor ).to.be.instanceOf( MockEditor );
				expect( firstEditor ).to.not.equal( editor );
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
							initialData: '1',
							key: 1,
							abc: 123
						}}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
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
							initialData: '1',
							key: 1,
							abc: 123
						}}
						onReady={ resolvedEditor => {
							editor = resolvedEditor;
						} }
					/>
				);

				component.setProps( {
					data: 'Hello World'
				} );

				expect( editor.data.get() ).to.be.equal( 'Hello World' );
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

				const component = render(
					<CKEditor
						editor={MockSlowEditor}
						config={{
							initialData: '1',
							key: 1,
							abc: 123
						}}
						onReady={manager.resolveOnRun( resolvedEditor => {
							initializerLog.push( {
								status: 'ready',
								id: resolvedEditor.config.key
							} );

							initializerLog.push( {
								status: 'destroy',
								id: resolvedEditor.config.key
							} );
						} )}
					/>
				);

				await manager.all();

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
			describe( `watchdog=${ enableWatchdog }`, testSemaphoreForWatchdog );
		}
	} );
} );

