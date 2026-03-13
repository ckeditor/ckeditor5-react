/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	assignDataPropToSingleRootEditorConfig,
	assignMultiRootDataPropToEditorConfig,
	isRootsMapConfigurationSupported
} from '../../src/utils/assignPropsToEditorConfig.js';

describe( 'assignPropsToEditorConfig', () => {
	let originalVersion: string | undefined;

	beforeEach( () => {
		originalVersion = window.CKEDITOR_VERSION;
	} );

	afterEach( () => {
		window.CKEDITOR_VERSION = originalVersion as any;
		vi.restoreAllMocks();
	} );

	describe( 'isRootsMapConfigurationSupported()', () => {
		it( 'should return true if window.CKEDITOR_VERSION is not defined', () => {
			delete ( window as any ).CKEDITOR_VERSION;
			expect( isRootsMapConfigurationSupported() ).toBe( true );
		} );

		it.each( [ 'nightly', '48.0.0', '49.0.0' ] )(
			'should return true if window.CKEDITOR_VERSION is "%s"',
			version => {
				window.CKEDITOR_VERSION = version as any;
				expect( isRootsMapConfigurationSupported() ).toBe( true );
			}
		);

		it.each( [ '47.0.0', '46.0.0' ] )(
			'should return false if window.CKEDITOR_VERSION is "%s"',
			version => {
				window.CKEDITOR_VERSION = version as any;
				expect( isRootsMapConfigurationSupported() ).toBe( false );
			}
		);
	} );

	describe( 'assignDataPropToSingleRootEditorConfig()', () => {
		describe( 'when roots map configuration is supported (>= 48.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '48.0.0';
			} );

			it( 'should assign data to roots.main.initialData', () => {
				expect( assignDataPropToSingleRootEditorConfig( {}, 'foo' ) ).toEqual( {
					roots: { main: { initialData: 'foo' } }
				} );
			} );

			it( 'should fallback to empty string if no data is provided', () => {
				expect( assignDataPropToSingleRootEditorConfig( {}, undefined ) ).toEqual( {
					roots: { main: { initialData: '' } }
				} );
			} );

			it( 'should prefer config.roots.main.initialData over data and show a warning', () => {
				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				expect( assignDataPropToSingleRootEditorConfig( { roots: { main: { initialData: 'config-data' } } }, 'foo' ) ).toEqual( {
					roots: { main: { initialData: 'config-data' } }
				} );

				expect( warnSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should prefer config.root.initialData over data and show a warning', () => {
				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				expect( assignDataPropToSingleRootEditorConfig( { root: { initialData: 'config-data' } }, 'foo' ) ).toEqual( {
					roots: { main: { initialData: 'config-data' } }
				} );

				expect( warnSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should prefer config.roots.main.initialData over config.root.initialData', () => {
				expect( assignDataPropToSingleRootEditorConfig(
					{ root: { initialData: 'root-data' }, roots: { main: { initialData: 'main-root-data' } } },
					'foo'
				) ).toEqual( {
					roots: { main: { initialData: 'main-root-data' } }
				} );
			} );
		} );

		describe( 'when roots map configuration is not supported (<= 47.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '47.0.0';
			} );

			it( 'should assign data to initialData', () => {
				expect( assignDataPropToSingleRootEditorConfig( {}, 'foo' ) ).toEqual( {
					initialData: 'foo'
				} );
			} );

			it( 'should fallback to empty string if no data is provided', () => {
				expect( assignDataPropToSingleRootEditorConfig( {}, undefined ) ).toEqual( {
					initialData: ''
				} );
			} );

			it( 'should prefer config.initialData over data and show a warning', () => {
				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				expect( assignDataPropToSingleRootEditorConfig( { initialData: 'config-data' }, 'foo' ) ).toEqual( {
					initialData: 'config-data'
				} );

				expect( warnSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );

	describe( 'assignMultiRootDataPropToEditorConfig()', () => {
		describe( 'when roots map configuration is supported (>= 48.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '48.0.0';
			} );

			it( 'should assign data to roots.<root name>.initialData', () => {
				expect( assignMultiRootDataPropToEditorConfig( {}, { root1: 'foo', root2: 'bar' } ) ).toEqual( {
					roots: {
						root1: { initialData: 'foo', modelElement: { attributes: {} } },
						root2: { initialData: 'bar', modelElement: { attributes: {} } }
					}
				} );
			} );

			it( 'should fallback to empty string if no data is provided for a root defined only via attributes', () => {
				expect( assignMultiRootDataPropToEditorConfig( {}, {}, { root1: { class: 'my-class' } } ) ).toEqual( {
					roots: {
						root1: { initialData: '', modelElement: { attributes: { class: 'my-class' } } }
					}
				} );
			} );

			it( 'should prefer config.roots.<root>.initialData over data and show a warning', () => {
				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
				const result = assignMultiRootDataPropToEditorConfig(
					{ roots: { root1: { initialData: 'config-data' } } },
					{ root1: 'foo' }
				);

				expect( result ).toEqual( {
					roots: {
						root1: { initialData: 'config-data', modelElement: { attributes: {} } }
					}
				} );

				expect( warnSpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'when roots map configuration is not supported (<= 47.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '47.0.0';
			} );

			it( 'should return config with rootsAttributes', () => {
				expect( assignMultiRootDataPropToEditorConfig( {}, { root1: 'foo' }, { root1: { class: 'my-class' } } ) ).toEqual( {
					rootsAttributes: { root1: { class: 'my-class' } }
				} );
			} );

			it( 'should show a warning if both config.initialData and data are provided', () => {
				const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

				expect( assignMultiRootDataPropToEditorConfig( { initialData: 'config-data' }, { root1: 'foo' } ) ).toEqual( {
					initialData: 'config-data',
					rootsAttributes: undefined
				} );

				expect( warnSpy ).toHaveBeenCalledOnce();
			} );
		} );
	} );
} );
