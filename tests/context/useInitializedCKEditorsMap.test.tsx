/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Collection } from 'ckeditor5';

import { useInitializedCKEditorsMap } from '../../src/context/useInitializedCKEditorsMap.js';

import type { ContextWatchdogValue } from '../../src/context/ckeditorcontext.js';
import type { CKEditorConfigContextMetadata } from '../../src/context/setCKEditorReactContextMetadata.js';

import MockEditor from '../_utils/editor.js';

describe( 'useInitializedCKEditorsMap', () => {
	afterEach( () => {
		vi.clearAllMocks();
	} );

	it( 'should not call onChangeInitializedEditors when context is not initialized', () => {
		const onChangeInitializedEditors = vi.fn();
		const mockWatchdog = {
			status: 'initializing' as const,
			watchdog: null
		};

		renderHook( () => useInitializedCKEditorsMap( {
			currentContextWatchdog: mockWatchdog,
			onChangeInitializedEditors
		} ) );

		expect( onChangeInitializedEditors ).not.toHaveBeenCalled();
	} );

	it( 'should not track editors that are not ready', () => {
		const editors = new Collection();
		const onChangeInitializedEditors = vi.fn();
		const notReadyEditor = createMockEditor( 'initializing', { name: '1' } );
		editors.add( notReadyEditor );

		renderHook( () => useInitializedCKEditorsMap( {
			currentContextWatchdog: createMockContextWatchdog( editors ),
			onChangeInitializedEditors
		} ) );

		expect( onChangeInitializedEditors ).not.toHaveBeenCalled();
	} );

	it( 'should track ready editors', () => {
		const editors = new Collection();
		const onChangeInitializedEditors = vi.fn();
		const readyEditor = createMockEditor( 'ready', { name: '1' } );
		editors.add( readyEditor );

		renderHook( () => useInitializedCKEditorsMap( {
			currentContextWatchdog: createMockContextWatchdog( editors ),
			onChangeInitializedEditors
		} ) );

		expect( onChangeInitializedEditors ).toHaveBeenCalledWith(
			expect.objectContaining( {
				'1': {
					instance: readyEditor,
					metadata: {
						name: '1'
					}
				}
			} ),
			expect.anything()
		);
	} );

	it( 'should handle adding new editors to collection', () => {
		const editors = new Collection();
		const onChangeInitializedEditors = vi.fn();

		renderHook( () => useInitializedCKEditorsMap( {
			currentContextWatchdog: createMockContextWatchdog( editors ),
			onChangeInitializedEditors
		} ) );

		const newEditor = createMockEditor( 'ready', { name: '2' } );
		editors.add( newEditor );

		// Simulate 'ready' event
		const readyCallback = newEditor.once.mock.calls.find( ( call: any ) => call[ 0 ] === 'ready' )![ 1 ];
		readyCallback();

		expect( onChangeInitializedEditors ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				'2': {
					instance: newEditor,
					metadata: {
						name: '2'
					}
				}
			} ),
			expect.anything()
		);
	} );

	it( 'should handle editor destruction', () => {
		const editors = new Collection();
		const onChangeInitializedEditors = vi.fn();
		const editor = createMockEditor( 'ready', { name: '1' } );
		editors.add( editor );

		renderHook( () => useInitializedCKEditorsMap( {
			currentContextWatchdog: createMockContextWatchdog( editors ),
			onChangeInitializedEditors
		} ) );

		// Simulate 'destroy' event
		const destroyCallback = editor.once.mock.calls.find( ( call: any ) => call[ 0 ] === 'destroy' )![ 1 ];
		editors.remove( editor );
		destroyCallback();

		expect( onChangeInitializedEditors ).toHaveBeenLastCalledWith(
			expect.objectContaining( {} ),
			expect.anything()
		);
	} );
} );

function createMockEditor( state = 'ready', contextMetadata: CKEditorConfigContextMetadata, config = {} ) {
	const editor = new MockEditor( document.createElement( 'div' ), {
		get( name: string ) {
			if ( name === '$__CKEditorReactContextMetadata' ) {
				return contextMetadata;
			}

			if ( Object.prototype.hasOwnProperty.call( config, name ) ) {
				return config[ name ];
			}

			return undefined;
		}
	} );

	editor.state = state;
	editor.once = vi.fn();

	return editor;
}

function createMockContextWatchdog( editors = new Collection() ) {
	return ( {
		status: 'initialized' as const,
		watchdog: {
			context: {
				editors
			}
		}
	} ) as unknown as ContextWatchdogValue<any>;
}
