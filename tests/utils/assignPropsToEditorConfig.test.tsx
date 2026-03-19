/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	assignDataPropToSingleRootEditorConfig,
	assignMultiRootAttributesPropToEditorConfig,
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
		it( 'should return false if window.CKEDITOR_VERSION is not defined', () => {
			delete ( window as any ).CKEDITOR_VERSION;
			expect( isRootsMapConfigurationSupported() ).toBe( false );
		} );

		it.each( [ 'nightly', '0.0.0-nightly-20260319.0', '48.0.0', '49.0.0' ] )(
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

	describe( 'assignMultiRootAttributesPropToEditorConfig()', () => {
		describe( 'when roots map configuration is supported (>= 48.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '48.0.0';
			} );

			it( 'should assign attributes to roots[rootName].modelAttributes', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {}, {
					intro: { order: 1 },
					outro: { order: 2 }
				} ) ).toEqual( {
					roots: {
						intro: { modelAttributes: { order: 1 } },
						outro: { modelAttributes: { order: 2 } }
					}
				} );
			} );

			it( 'should set modelAttributes to empty object when no attributes are provided', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {
					roots: { intro: { initialData: 'hello' } }
				}, undefined ) ).toEqual( {
					roots: {
						intro: { initialData: 'hello', modelAttributes: {} }
					}
				} );
			} );

			it( 'should merge attributes with existing config.roots properties', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {
					roots: { intro: { initialData: 'hello' } }
				}, {
					intro: { order: 1 }
				} ) ).toEqual( {
					roots: {
						intro: { initialData: 'hello', modelAttributes: { order: 1 } }
					}
				} );
			} );

			it( 'should prefer passed attributes over config.roots[rootName].modelAttributes', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {
					roots: { intro: { modelAttributes: { order: 99 } } }
				}, {
					intro: { order: 1 }
				} ) ).toEqual( {
					roots: {
						intro: { modelAttributes: { order: 1 } }
					}
				} );
			} );

			it( 'should fall back to config.roots[rootName].modelAttributes when no attributes entry for that root', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {
					roots: { intro: { modelAttributes: { order: 5 } } }
				}, {} ) ).toEqual( {
					roots: {
						intro: { modelAttributes: { order: 5 } }
					}
				} );
			} );

			it( 'should include roots from attributes that are absent in config.roots', () => {
				const result = assignMultiRootAttributesPropToEditorConfig( {
					roots: { intro: { initialData: 'a' } }
				}, {
					intro: { order: 1 },
					outro: { order: 2 }
				} ) as any;

				expect( result.roots ).toHaveProperty( 'intro' );
				expect( result.roots ).toHaveProperty( 'outro' );
				expect( result.roots.outro ).toEqual( { modelAttributes: { order: 2 } } );
			} );

			it( 'should include roots from config.roots that are absent in attributes', () => {
				const result = assignMultiRootAttributesPropToEditorConfig( {
					roots: {
						intro: { initialData: 'a' },
						outro: { initialData: 'b' }
					}
				}, {
					intro: { order: 1 }
				} ) as any;

				expect( result.roots ).toHaveProperty( 'intro' );
				expect( result.roots ).toHaveProperty( 'outro' );
				expect( result.roots.outro ).toEqual( { initialData: 'b', modelAttributes: {} } );
			} );

			it( 'should preserve other config properties alongside roots', () => {
				const result = assignMultiRootAttributesPropToEditorConfig( {
					language: 'pl',
					roots: { intro: {} }
				}, { intro: { order: 1 } } ) as any;

				expect( result.language ).toBe( 'pl' );
			} );
		} );

		describe( 'when roots map configuration is not supported (<= 47.x)', () => {
			beforeEach( () => {
				window.CKEDITOR_VERSION = '47.0.0';
			} );

			it( 'should assign attributes to rootsAttributes', () => {
				const attributes = {
					intro: { order: 1 },
					outro: { order: 2 }
				};

				expect( assignMultiRootAttributesPropToEditorConfig( {}, attributes ) ).toEqual( {
					rootsAttributes: attributes
				} );
			} );

			it( 'should assign undefined to rootsAttributes when no attributes are provided', () => {
				expect( assignMultiRootAttributesPropToEditorConfig( {} ) ).toEqual( {
					rootsAttributes: undefined
				} );
			} );

			it( 'should preserve other config properties alongside rootsAttributes', () => {
				const result = assignMultiRootAttributesPropToEditorConfig( {
					language: 'pl'
				}, { intro: { order: 1 } } ) as any;

				expect( result.language ).toBe( 'pl' );
				expect( result.rootsAttributes ).toEqual( { intro: { order: 1 } } );
			} );
		} );
	} );
} );
