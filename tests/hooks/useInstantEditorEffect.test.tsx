/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInstantEditorEffect } from '../../src/hooks/useInstantEditorEffect.js';

describe( 'useInstantEditorEffect', () => {
	it( 'should execute the provided function after mounting of editor', () => {
		const semaphore = {
			runAfterMount: vi.fn()
		};

		const fn = vi.fn();

		renderHook( () => useInstantEditorEffect( semaphore, fn, [] ) );
		expect( semaphore.runAfterMount ).toHaveBeenCalledWith( fn );
	} );

	it( 'should not execute the provided function if semaphore is null', () => {
		const semaphore = null;

		const fn = vi.fn();

		renderHook( () => useInstantEditorEffect( semaphore, fn, [] ) );

		expect( fn ).not.toHaveBeenCalled();
	} );

	it( 'should re-execute the provided function when the dependencies change', () => {
		const semaphore = {
			runAfterMount: vi.fn()
		};

		const fn = vi.fn();

		const { rerender } = renderHook( ( { semaphore, fn } ) => useInstantEditorEffect( semaphore, fn, [ semaphore ] ), {
			initialProps: { semaphore, fn }
		} );

		expect( semaphore.runAfterMount ).toHaveBeenCalledOnce();

		const newSemaphore = {
			runAfterMount: vi.fn()
		};

		rerender( {
			semaphore: newSemaphore,
			fn
		} );

		expect( semaphore.runAfterMount ).toHaveBeenCalledOnce();
		expect( newSemaphore.runAfterMount ).toHaveBeenCalledOnce();
	} );

	it( 'should not re-execute the provided function when the dependencies do not change', () => {
		const semaphore = {
			runAfterMount: vi.fn()
		};

		const fn = vi.fn();

		const { rerender } = renderHook( ( { semaphore, fn } ) => useInstantEditorEffect( semaphore, fn, [ semaphore ] ), {
			initialProps: { semaphore, fn }
		} );

		expect( semaphore.runAfterMount ).toHaveBeenCalledOnce();

		rerender( {
			semaphore,
			fn
		} );

		expect( semaphore.runAfterMount ).toHaveBeenCalledOnce();
	} );
} );
