/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assignDataPropToSingleRootEditorConfig } from '../../src/compatibility/assignDataPropToSingleRootEditorConfig.js';

describe( 'assignDataPropToSingleRootEditorConfig', () => {
	let originalVersion: string | undefined;

	beforeEach( () => {
		originalVersion = window.CKEDITOR_VERSION;
	} );

	afterEach( () => {
		window.CKEDITOR_VERSION = originalVersion as any;
		vi.restoreAllMocks();
	} );

	describe( 'when roots map configuration is supported (>= 48.x)', () => {
		beforeEach( () => {
			window.CKEDITOR_VERSION = '48.0.0';
		} );

		it( 'should assign data to roots.main.initialData', () => {
			expect( assignDataPropToSingleRootEditorConfig( 'foo', {} ) ).toEqual( {
				roots: { main: { initialData: 'foo' } }
			} );
		} );

		it( 'should fallback to empty string if no data is provided', () => {
			expect( assignDataPropToSingleRootEditorConfig( undefined, {} ) ).toEqual( {
				roots: { main: { initialData: '' } }
			} );
		} );

		it( 'should prefer config.roots.main.initialData over data and show a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			expect( assignDataPropToSingleRootEditorConfig( 'foo', { roots: { main: { initialData: 'config-data' } } } ) ).toEqual( {
				roots: { main: { initialData: 'config-data' } }
			} );

			expect( warnSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should prefer config.root.initialData over data and show a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			expect( assignDataPropToSingleRootEditorConfig( 'foo', { root: { initialData: 'config-data' } } ) ).toEqual( {
				roots: { main: { initialData: 'config-data' } }
			} );

			expect( warnSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should prefer config.roots.main.initialData over config.root.initialData', () => {
			const config = assignDataPropToSingleRootEditorConfig(
				'foo',
				{ root: { initialData: 'root-data' }, roots: { main: { initialData: 'main-root-data' } } }
			);

			expect( config ).toEqual( {
				roots: { main: { initialData: 'main-root-data' } }
			} );
		} );
	} );

	describe( 'when roots map configuration is not supported (<= 47.x)', () => {
		beforeEach( () => {
			window.CKEDITOR_VERSION = '47.0.0';
		} );

		it( 'should assign data to initialData', () => {
			expect( assignDataPropToSingleRootEditorConfig( 'foo', {} ) ).toEqual( {
				initialData: 'foo'
			} );
		} );

		it( 'should fallback to empty string if no data is provided', () => {
			expect( assignDataPropToSingleRootEditorConfig( undefined, {} ) ).toEqual( {
				initialData: ''
			} );
		} );

		it( 'should prefer config.initialData over data and show a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			expect( assignDataPropToSingleRootEditorConfig( 'foo', { initialData: 'config-data' } ) ).toEqual( {
				initialData: 'config-data'
			} );

			expect( warnSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
