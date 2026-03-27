/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { assignElementToEditorConfig } from '../../src/compatibility/assignElementToEditorConfig.js';
import type { EditorConstructor } from '../../src/types/EditorConstructor.js';

function createEditorConstructor( editorName?: string ): EditorConstructor {
	return { editorName } as unknown as EditorConstructor;
}

describe( 'assignElementToEditorConfig', () => {
	let element: HTMLElement;

	beforeEach( () => {
		element = document.createElement( 'div' );
	} );

	describe( 'ClassicEditor (attachTo)', () => {
		it( 'should assign element to attachTo when editorName is "ClassicEditor"', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'ClassicEditor' ),
				element,
				{}
			);

			expect( config.attachTo ).toBe( element );
		} );

		it( 'should assign element to attachTo when editorName is undefined', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( undefined ),
				element,
				{}
			);

			expect( config.attachTo ).toBe( element );
		} );

		it( 'should preserve other config properties', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'ClassicEditor' ),
				element,
				{ language: 'pl' }
			) as any;

			expect( config.language ).toBe( 'pl' );
			expect( config.attachTo ).toBe( element );
		} );

		it( 'should override existing attachTo with the new element', () => {
			const oldElement = document.createElement( 'div' );

			const config = assignElementToEditorConfig(
				createEditorConstructor( 'ClassicEditor' ),
				element,
				{ attachTo: oldElement }
			);

			expect( config.attachTo ).toBe( element );
		} );

		it( 'should not set roots.main.element', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'ClassicEditor' ),
				element,
				{}
			) as any;

			expect( config.roots?.main?.element ).toBeUndefined();
		} );
	} );

	describe( 'non-ClassicEditor (roots.main.element)', () => {
		it( 'should assign element to roots.main.element for DecoupledEditor', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{}
			) as any;

			expect( config.roots.main.element ).toBe( element );
		} );

		it( 'should assign element to roots.main.element for InlineEditor', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'InlineEditor' ),
				element,
				{}
			) as any;

			expect( config.roots.main.element ).toBe( element );
		} );

		it( 'should not set attachTo', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{}
			);

			expect( config.attachTo ).toBeUndefined();
		} );

		it( 'should delete config.root after mapping', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ root: { initialData: 'hello' } }
			) as any;

			expect( config.root ).toBeUndefined();
		} );

		it( 'should merge config.root into roots.main', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ root: { initialData: 'hello' } }
			) as any;

			expect( config.roots.main.initialData ).toBe( 'hello' );
			expect( config.roots.main.element ).toBe( element );
		} );

		it( 'should merge existing config.roots.main into result', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ roots: { main: { initialData: 'from-roots' } } }
			) as any;

			expect( config.roots.main.initialData ).toBe( 'from-roots' );
			expect( config.roots.main.element ).toBe( element );
		} );

		it( 'should let config.roots.main take precedence over config.root', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{
					root: { initialData: 'from-root' },
					roots: { main: { initialData: 'from-roots-main' } }
				}
			) as any;

			expect( config.roots.main.initialData ).toBe( 'from-roots-main' );
		} );

		it( 'should preserve other roots alongside main', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ roots: { outro: { initialData: 'outro' } } }
			) as any;

			expect( config.roots ).toHaveProperty( 'outro' );
			expect( config.roots ).toHaveProperty( 'main' );
		} );

		it( 'should preserve other top-level config properties', () => {
			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ language: 'pl' }
			) as any;

			expect( config.language ).toBe( 'pl' );
		} );

		it( 'should override existing roots.main.element with the new element', () => {
			const oldElement = document.createElement( 'span' );

			const config = assignElementToEditorConfig(
				createEditorConstructor( 'DecoupledEditor' ),
				element,
				{ roots: { main: { element: oldElement } } }
			) as any;

			expect( config.roots.main.element ).toBe( element );
		} );
	} );
} );
