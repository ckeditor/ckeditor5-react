/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import { EditorElement } from '../src/EditorElement.js';
import type { EditorElementObjectDefinition } from '../src/utils/normalizeEditorElementDefinition.js';

describe( 'EditorElement', () => {
	it( 'renders a default <div> element when no definition is provided', () => {
		const { container } = render( <EditorElement /> );

		expect( container.firstElementChild?.tagName ).toBe( 'DIV' );
	} );

	it( 'renders an element based on a string definition', () => {
		const { container } = render( <EditorElement definition="section" /> );

		expect( container.firstElementChild?.tagName ).toBe( 'SECTION' );
	} );

	it( 'renders a React component based on the provided definition', () => {
		const CustomComponent = ( props: any ) => <article {...props} data-custom="true" />;

		const { container } = render( <EditorElement definition={CustomComponent} /> );

		expect( container.firstElementChild?.tagName ).toBe( 'ARTICLE' );
		expect( container.firstElementChild?.getAttribute( 'data-custom' ) ).toBe( 'true' );
	} );

	it( 'renders an element based on an object definition with id, classes, styles, and attributes', () => {
		const definition: EditorElementObjectDefinition = {
			name: 'p',
			classes: [ 'class1', 'class2' ],
			styles: { color: 'red', marginTop: '10px' },
			attributes: { 'data-test': 'value123', 'aria-label': 'test-label' }
		};

		const { container } = render( <EditorElement definition={definition} /> );
		const element = container.firstElementChild as HTMLElement;

		expect( element.tagName ).toBe( 'P' );

		expect( element.className ).toContain( 'class1' );
		expect( element.className ).toContain( 'class2' );

		expect( element.style.color ).toBe( 'red' );
		expect( element.style.marginTop ).toBe( '10px' );
		expect( element.getAttribute( 'data-test' ) ).toBe( 'value123' );
		expect( element.getAttribute( 'aria-label' ) ).toBe( 'test-label' );
	} );

	it( 'throws an error when an HTMLElement instance is passed as a definition', () => {
		const consoleErrorSpy = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

		const divElement = document.createElement( 'div' );

		expect( () => {
			render( <EditorElement definition={divElement as any} /> );
		} ).toThrow(
			'An HTMLElement cannot be used as an editor element definition. ' +
			'Please pass a string, a React component, or an object definition.'
		);

		consoleErrorSpy.mockRestore();
	} );

	it( 'correctly forwards the ref to the rendered DOM element', () => {
		const ref = createRef<HTMLElement>();

		render( <EditorElement ref={ref} definition="span" /> );

		expect( ref.current ).not.toBeNull();
		expect( ref.current?.tagName ).toBe( 'SPAN' );
	} );

	it( 'should be possible to pass styles in camel case', () => {
		const { container } = render(
			<EditorElement
				definition={{
					name: 'section',
					styles: {
						fontWeight: 'bold'
					}
				}}
			/>
		);

		expect( ( container.firstElementChild as HTMLElement ).style.fontWeight ).toBe( 'bold' );
	} );

	it( 'should be possible to pass styles in kebab case', () => {
		const { container } = render(
			<EditorElement
				definition={{
					name: 'section',
					styles: {
						'font-weight': 'bold'
					}
				}}
			/>
		);

		expect( ( container.firstElementChild as HTMLElement ).style.fontWeight ).toBe( 'bold' );
	} );
} );
