/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assignDataPropToMultiRootEditorConfig } from '../../src/compatibility/assignDataPropToMultirootEditorConfig.js';

describe( 'assignDataPropToMultiRootEditorConfig', () => {
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

		it( 'should assign data to roots[rootName].initialData', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello', outro: 'world' },
				{}
			);

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: 'hello' },
					outro: { initialData: 'world' }
				}
			} );
		} );

		it( 'should fallback to empty string for roots without data', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello' },
				{
					roots: { intro: {}, outro: {} }
				}
			);

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: 'hello' },
					outro: { initialData: '' }
				}
			} );
		} );

		it( 'should handle undefined data and fallback to empty string for all config roots', () => {
			const config = assignDataPropToMultiRootEditorConfig( undefined, {
				roots: { intro: {}, outro: {} }
			} );

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: '' },
					outro: { initialData: '' }
				}
			} );
		} );

		it( 'should prefer config.roots[rootName].initialData over data and show a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'data-value' },
				{ roots: { intro: { initialData: 'config-value' } } }
			);

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: 'config-value' }
				}
			} );

			expect( warnSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should warn once per conflicting root, not once globally', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			assignDataPropToMultiRootEditorConfig(
				{ intro: 'a', outro: 'b' },
				{
					roots: {
						intro: { initialData: 'config-intro' },
						outro: { initialData: 'config-outro' }
					}
				}
			);

			expect( warnSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should not warn when only data is provided (no conflict)', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			assignDataPropToMultiRootEditorConfig( { intro: 'hello' }, {} );

			expect( warnSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not warn when only config.roots[rootName].initialData is provided (no conflict)', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			assignDataPropToMultiRootEditorConfig( undefined, {
				roots: { intro: { initialData: 'config-value' } }
			} );

			expect( warnSpy ).not.toHaveBeenCalled();
		} );

		it( 'should merge roots from data and config.roots', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello' },
				{ roots: { outro: {} } }
			) as any;

			expect( config.roots ).toHaveProperty( 'intro' );
			expect( config.roots ).toHaveProperty( 'outro' );
		} );

		it( 'should preserve existing config.roots properties alongside initialData', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello' },
				{ roots: { intro: { modelAttributes: { order: 1 } } } }
			);

			expect( config ).toEqual( {
				roots: {
					intro: { modelAttributes: { order: 1 }, initialData: 'hello' }
				}
			} );
		} );

		it( 'should preserve other top-level config properties', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello' },
				{ language: 'pl', roots: { intro: {} } }
			) as any;

			expect( config.language ).toBe( 'pl' );
		} );

		it( 'should return empty roots when both data and config are empty', () => {
			const config = assignDataPropToMultiRootEditorConfig( undefined, {} );

			expect( config ).toEqual( { roots: {} } );
		} );
	} );

	describe( 'when roots map configuration is not supported (<= 47.x)', () => {
		beforeEach( () => {
			window.CKEDITOR_VERSION = '47.0.0';
		} );

		it( 'should assign data to initialData', () => {
			const data = { intro: 'hello', outro: 'world' };

			expect( assignDataPropToMultiRootEditorConfig( data, {} ) ).toEqual( {
				initialData: data
			} );
		} );

		it( 'should assign undefined to initialData when no data is provided', () => {
			expect( assignDataPropToMultiRootEditorConfig( undefined, {} ) ).toEqual( {
				initialData: undefined
			} );
		} );

		it( 'should prefer config.initialData over data and show a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const existingInitialData = { intro: 'config-data' };
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'data-value' },
				{ initialData: existingInitialData as any }
			);

			expect( config ).toEqual( {
				initialData: existingInitialData
			} );

			expect( warnSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not warn when only data is provided (no conflict)', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			assignDataPropToMultiRootEditorConfig( { intro: 'hello' }, {} );

			expect( warnSpy ).not.toHaveBeenCalled();
		} );

		it( 'should preserve other config properties alongside initialData', () => {
			const config = assignDataPropToMultiRootEditorConfig(
				{ intro: 'hello' },
				{ language: 'pl' }
			) as any;

			expect( config.language ).toBe( 'pl' );
			expect( config.initialData ).toEqual( { intro: 'hello' } );
		} );
	} );
} );
