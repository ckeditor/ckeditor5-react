/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { normalizeStylesMap } from '../../src/utils/normalizeStylesMap.js';

describe( 'normalizeStylesMap', () => {
	it( 'should return an empty object when given an empty object', () => {
		expect( normalizeStylesMap( {} ) ).toEqual( {} );
	} );

	it( 'should convert a kebab-case key to camelCase', () => {
		expect( normalizeStylesMap( { 'background-color': 'red' } ) ).toEqual( { backgroundColor: 'red' } );
	} );

	it( 'should convert multiple kebab-case keys to camelCase', () => {
		expect( normalizeStylesMap( {
			'background-color': 'red',
			'font-size': '16px',
			'border-top-width': '1px'
		} ) ).toEqual( {
			backgroundColor: 'red',
			fontSize: '16px',
			borderTopWidth: '1px'
		} );
	} );

	it( 'should preserve CSS custom property key starting with --', () => {
		expect( normalizeStylesMap( { '--my-color': 'blue' } ) ).toEqual( { '--my-color': 'blue' } );
	} );

	it( 'should preserve CSS custom property keys with multiple kebab segments unchanged', () => {
		expect( normalizeStylesMap( { '--primary-background-color': '#fff' } ) ).toEqual( {
			'--primary-background-color': '#fff'
		} );
	} );

	it( 'should handle a mix of regular and CSS custom property keys', () => {
		expect( normalizeStylesMap( {
			'--accent-color': 'green',
			'font-weight': 'bold',
			'--spacing-sm': '4px',
			'margin-top': '8px'
		} ) ).toEqual( {
			'--accent-color': 'green',
			fontWeight: 'bold',
			'--spacing-sm': '4px',
			marginTop: '8px'
		} );
	} );

	it( 'should leave single-word keys unchanged', () => {
		expect( normalizeStylesMap( { color: 'red', display: 'flex' } ) ).toEqual( {
			color: 'red',
			display: 'flex'
		} );
	} );

	it( 'should preserve values as-is', () => {
		expect( normalizeStylesMap( { 'background-image': 'url("test.png")' } ) ).toEqual( {
			backgroundImage: 'url("test.png")'
		} );
	} );
} );
