/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { assignMultiRootAttributesPropToEditorConfig } from '../../src/compatibility/assignMultiRootAttributesPropToEditorConfig.js';

describe( 'assignMultiRootAttributesPropToEditorConfig', () => {
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

		it( 'should assign attributes to roots[rootName].modelAttributes', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {
				intro: { order: 1 },
				outro: { order: 2 }
			}, {} );

			expect( config ).toEqual( {
				roots: {
					intro: { modelAttributes: { order: 1 } },
					outro: { modelAttributes: { order: 2 } }
				}
			} );
		} );

		it( 'should set modelAttributes to empty object when no attributes are provided', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( undefined, {
				roots: { intro: { initialData: 'hello' } }
			} );

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: 'hello', modelAttributes: {} }
				}
			} );
		} );

		it( 'should merge attributes with existing config.roots properties', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {
				intro: { order: 1 }
			}, {
				roots: { intro: { initialData: 'hello' } }
			} );

			expect( config ).toEqual( {
				roots: {
					intro: { initialData: 'hello', modelAttributes: { order: 1 } }
				}
			} );
		} );

		it( 'should prefer passed attributes over config.roots[rootName].modelAttributes', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {
				intro: { order: 1 }
			}, {
				roots: { intro: { modelAttributes: { order: 99 } } }
			} );

			expect( config ).toEqual( {
				roots: {
					intro: { modelAttributes: { order: 1 } }
				}
			} );
		} );

		it( 'should fall back to config.roots[rootName].modelAttributes when no attributes entry for that root', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {}, {
				roots: { intro: { modelAttributes: { order: 5 } } }
			} );

			expect( config ).toEqual( {
				roots: {
					intro: { modelAttributes: { order: 5 } }
				}
			} );
		} );

		it( 'should include roots from attributes that are absent in config.roots', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {
				intro: { order: 1 },
				outro: { order: 2 }
			}, {
				roots: { intro: { initialData: 'a' } }
			} ) as any;

			expect( config.roots ).toHaveProperty( 'intro' );
			expect( config.roots ).toHaveProperty( 'outro' );
			expect( config.roots.outro ).toEqual( { modelAttributes: { order: 2 } } );
		} );

		it( 'should include roots from config.roots that are absent in attributes', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( {
				intro: { order: 1 }
			}, {
				roots: {
					intro: { initialData: 'a' },
					outro: { initialData: 'b' }
				}
			} ) as any;

			expect( config.roots ).toHaveProperty( 'intro' );
			expect( config.roots ).toHaveProperty( 'outro' );
			expect( config.roots.outro ).toEqual( { initialData: 'b', modelAttributes: {} } );
		} );

		it( 'should preserve other config properties alongside roots', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( { intro: { order: 1 } }, {
				language: 'pl',
				roots: { intro: {} }
			} ) as any;

			expect( config.language ).toBe( 'pl' );
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

			expect( assignMultiRootAttributesPropToEditorConfig( attributes, {} ) ).toEqual( {
				rootsAttributes: attributes
			} );
		} );

		it( 'should assign undefined to rootsAttributes when no attributes are provided', () => {
			expect( assignMultiRootAttributesPropToEditorConfig( undefined, {} ) ).toEqual( {
				rootsAttributes: undefined
			} );
		} );

		it( 'should preserve other config properties alongside rootsAttributes', () => {
			const config = assignMultiRootAttributesPropToEditorConfig( { intro: { order: 1 } }, {
				language: 'pl'
			} ) as any;

			expect( config.language ).toBe( 'pl' );
			expect( config.rootsAttributes ).toEqual( { intro: { order: 1 } } );
		} );
	} );
} );
