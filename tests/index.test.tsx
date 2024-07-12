/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { describe, afterEach, it, expect, vi } from 'vitest';
import React from 'react';
import { ContextWatchdog } from 'ckeditor5';
import { render, type RenderResult } from '@testing-library/react';
import ContextMock from './_utils/context.js';
import Editor from './_utils/editor.js';
import { PromiseManager } from './_utils/promisemanager.js';
import { CKEditor, CKEditorContext } from '../src/index';

const MockEditor = Editor as any;

describe( 'index.js', () => {
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

	it( 'should be the CKEditor Component', async () => {
		let editor: typeof MockEditor;

		component = render(
			<CKEditor
				editor={ MockEditor }
				onReady={ manager.resolveOnRun( instance => {
					editor = instance;
				} ) }
			/>
		);

		await manager.all();

		expect( CKEditor ).to.be.a( 'function' );
		expect( editor ).to.be.instanceOf( MockEditor );
	} );

	it( 'should be the CKEditorContext Component', async () => {
		let context: typeof ContextMock;

		component = render(
			<CKEditorContext
				context={ ContextMock }
				contextWatchdog={ ContextWatchdog }
				onReady={ manager.resolveOnRun( instance => {
					context = instance;
				} ) }
			/>
		);

		await manager.all();

		expect( CKEditorContext ).to.be.a( 'function' );
		expect( context! ).to.be.instanceOf( ContextMock );
	} );
} );
