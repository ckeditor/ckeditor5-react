/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock( '@ckeditor/ckeditor5-integrations-common', async importOriginal => {
	const actual = await importOriginal() as Record<string, any>;

	return {
		...actual,
		getInstalledCKBaseFeatures: () => ( {
			...actual.getInstalledCKBaseFeatures(),
			elementConfigAttachment: false,
			rootsConfigEntry: false
		} )
	};
} );

import { useMultiRootEditor } from '../../src/multiroot/useMultiRootEditor.js';
import { TestMultiRootEditor } from '../_utils/multirooteditor.js';

describe( 'useMultiRootEditor legacy features', () => {
	const rootsContent = {
		intro: '<h2>Sample</h2><p>This is an instance of the.</p>',
		content: '<p>It is the custom content</p>',
		footer: '<p>Footer content</p>'
	};

	const rootsAttributes = {
		intro: {
			row: '1',
			order: 10
		},
		content: {
			row: '1',
			order: 20
		},
		footer: {
			row: '2',
			order: 30
		}
	};

	const editorProps = {
		semaphoreElement: null as any,
		editor: TestMultiRootEditor,
		data: rootsContent,
		rootsAttributes,
		config: {
			rootsAttributes
		}
	};

	beforeEach( () => {
		editorProps.semaphoreElement = document.createElement( 'div' );
		vi.spyOn( console, 'error' ).mockImplementation( () => {} );
		vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	it( 'should support the legacy watchdog creator signature and root configuration shape', async () => {
		const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

		await waitFor( () => {
			expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
		} );

		const addRootSpy = vi.spyOn( result.current.editor!, 'addRoot' );

		act( () => {
			result.current.setData( { ...rootsContent, outro: 'New data' } );
			result.current.setAttributes( { ...rootsAttributes, outro: { foo: 'bar' } } );
		} );

		await waitFor( () => {
			expect( addRootSpy ).toHaveBeenCalledWith( 'outro', {
				isUndoable: true,
				data: 'New data',
				attributes: { foo: 'bar' }
			} );
		} );
	} );
} );
