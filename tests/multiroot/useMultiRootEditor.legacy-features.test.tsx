/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import { useMultiRootEditor } from '../../src/multiroot/useMultiRootEditor.js';
import { TestMultiRootEditor } from '../_utils/multirooteditor.js';
import { getInstalledCKBaseFeatures } from '@ckeditor/ckeditor5-integrations-common';

const SUPPORTED_FEATURES = getInstalledCKBaseFeatures();

const legacyWatchdogTest = SUPPORTED_FEATURES.elementConfigAttachment ? it.skip : it;
const legacyRootConfigTest = SUPPORTED_FEATURES.rootsConfigEntry ? it.skip : it;

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

	legacyWatchdogTest( 'should support the legacy watchdog creator signature', async () => {
		const { result } = renderHook( () => useMultiRootEditor( editorProps ) );

		await waitFor( () => {
			expect( result.current.editor ).to.be.instanceof( TestMultiRootEditor );
		} );
	} );

	legacyRootConfigTest( 'should support the legacy root configuration shape', async () => {
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
