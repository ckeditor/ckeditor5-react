/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDefer } from '../_utils/defer';
import {
	LifeCycleElementSemaphore,
	type LifeCycleAsyncOperators
} from '../../src/lifecycle/LifeCycleElementSemaphore';

describe( 'LifeCycleElementSemaphore', () => {
	let element: HTMLElement;
	let lifecycle: LifeCycleAsyncOperators<any>;
	let semaphore: LifeCycleElementSemaphore<any>;

	beforeEach( () => {
		element = document.createElement( 'div' );
		lifecycle = {
			mount: async () => {},
			unmount: async () => {}
		};

		semaphore = new LifeCycleElementSemaphore( element, lifecycle );
	} );

	afterEach( () => {
		semaphore.release();
		vi.restoreAllMocks();
		vi.clearAllTimers();
	} );

	it( 'should initialize with correct values', () => {
		expect( semaphore.value ).toBeNull();
	} );

	it( 'should set value correctly', () => {
		const value = {};

		semaphore.unsafeSetValue( value );

		expect( semaphore.value ).toBe( value );
	} );

	it( 'should run after mount callback immediately if value is already set', () => {
		const value = {};
		const callback = vi.fn();

		semaphore.unsafeSetValue( value );
		semaphore.runAfterMount( callback );

		expect( callback ).toHaveBeenCalledWith( value );
	} );

	it( 'should run after mount callback after mount', async () => {
		const value = {};
		const callback = vi.fn();

		semaphore.runAfterMount( callback );
		semaphore.unsafeSetValue( value );

		await new Promise( resolve => setTimeout( resolve, 0 ) );

		expect( callback ).toHaveBeenCalledWith( value );
	} );

	it( 'should not run after mount callback if value is not set', () => {
		const callback = vi.fn();

		semaphore.runAfterMount( callback );
		expect( callback ).not.toHaveBeenCalled();
	} );

	it( 'should wait for previous semaphore to be resolved on element to start mounting new one', async () => {
		const sharedElement = document.createElement( 'div' );
		const firstMountDefer = createDefer();

		const firstLifeCycle: LifeCycleAsyncOperators<any> = {
			mount: async () => {
				await firstMountDefer.promise;
				return 'mounted';
			},
			unmount: vi.fn( async () => {} )
		};

		const secondLifeCycle: LifeCycleAsyncOperators<any> = {
			mount: vi.fn( async () => {} ),
			unmount: vi.fn( async () => {} )
		};

		const firstSemaphore = new LifeCycleElementSemaphore( sharedElement, firstLifeCycle );

		// eslint-disable-next-line no-new
		new LifeCycleElementSemaphore( sharedElement, secondLifeCycle );

		// It may be not needed but it's better to wait for the next tick to ensure that the first semaphore is waiting
		// for the defer to be resolved.
		await new Promise( resolve => setTimeout( resolve, 0 ) );

		// It's still mounting at this stage.
		expect( firstLifeCycle.unmount ).not.toBeCalled();
		expect( secondLifeCycle.mount ).not.toBeCalled();

		// Resolve the first semaphore, first semaphore is mounted.
		firstMountDefer.resolve();

		await vi.waitFor( () => {
			expect( firstSemaphore.value ).toBe( 'mounted' );
		} );

		firstSemaphore.release();

		// Second semaphore can be now mounted.
		await vi.waitFor( async () => {
			expect( firstLifeCycle.unmount ).toBeCalled();
			expect( secondLifeCycle.mount ).toBeCalled();
		} );
	} );

	it( 'should not call lifecycle methods of the second semaphore when three are mounted in the row', async () => {
		const sharedElement = document.createElement( 'div' );
		const firstMountDefer = createDefer();

		const firstLifeCycle: LifeCycleAsyncOperators<any> = {
			mount: async () => {
				await firstMountDefer.promise;
				return 'mounted';
			},
			unmount: vi.fn( async () => {} )
		};

		const secondLifeCycle: LifeCycleAsyncOperators<any> = {
			mount: vi.fn( async () => {} ),
			unmount: vi.fn( async () => {} )
		};

		const thirdLifeCycle: LifeCycleAsyncOperators<any> = {
			mount: vi.fn( async () => {} ),
			unmount: vi.fn( async () => {} )
		};

		// In this scenario it should trigger `mount` and `unmount` lifecycle methods of the first semaphore
		// and the last one. The second semaphore should be skipped because it has been released before
		// fully initialization of first semaphore.
		const firstSemaphore = new LifeCycleElementSemaphore( sharedElement, firstLifeCycle );

		// This one should be skipped.
		const secondSemaphore = new LifeCycleElementSemaphore( sharedElement, secondLifeCycle );
		secondSemaphore.release();

		// eslint-disable-next-line no-new
		new LifeCycleElementSemaphore( sharedElement, thirdLifeCycle );

		// Resolve the first semaphore, first semaphore is mounted
		firstMountDefer.resolve();

		await vi.waitFor( () => {
			expect( firstSemaphore.value ).toBe( 'mounted' );
		} );

		firstSemaphore.release();

		// Second semaphore should be skipped and third one should be initialized instead.
		await vi.waitFor( async () => {
			expect( firstLifeCycle.unmount ).toBeCalled();

			// Skipped semaphore.
			expect( secondLifeCycle.mount ).not.toBeCalled();
			expect( secondLifeCycle.unmount ).not.toBeCalled();

			// Initialized semaphore.
			expect( thirdLifeCycle.mount ).toBeCalled();
		} );
	} );

	it( 'should log console error when semaphore thrown exception during unmount', async () => {
		const error = new Error( 'Unmount error' );
		const semaphore = new LifeCycleElementSemaphore( document.createElement( 'div' ), {
			mount: async () => 'mounted',
			unmount: async () => {
				throw error;
			}
		} );

		const consoleError = vi.spyOn( console, 'error' );

		await vi.waitFor( () => {
			expect( semaphore.value ).toBe( 'mounted' );
		} );

		semaphore.release();

		await vi.waitFor( () => {
			expect( consoleError ).toBeCalledWith( 'Semaphore unmounting error:', error );
		} );
	} );

	it( 'should log console error when semaphore thrown exception during mount', async () => {
		const error = new Error( 'Unmount error' );
		const consoleError = vi.spyOn( console, 'error' );

		// eslint-disable-next-line no-new
		new LifeCycleElementSemaphore( document.createElement( 'div' ), {
			mount: async () => {
				throw error;
			},
			unmount: async () => {}
		} );

		await vi.waitFor( () => {
			expect( consoleError ).toBeCalledWith( 'Semaphore mounting error:', error );
		} );
	} );

	it( 'should not call `afterMount` lifecycle method if there is no mount result', async () => {
		const defer = createDefer();
		const runAfterMount = vi.fn();

		// eslint-disable-next-line no-new
		new LifeCycleElementSemaphore( document.createElement( 'div' ), {
			mount: async () => {
				await defer.promise;
			},
			unmount: async () => {},
			afterMount: runAfterMount
		} );

		expect( runAfterMount ).not.toBeCalled();
		defer.resolve();

		await new Promise( resolve => setTimeout( resolve, 0 ) );

		expect( runAfterMount ).not.toHaveBeenCalled();
	} );

	it( 'should call `afterMount` lifecycle method if there is mount result', async () => {
		const defer = createDefer();
		const runAfterMount = vi.fn();

		// eslint-disable-next-line no-new
		new LifeCycleElementSemaphore( document.createElement( 'div' ), {
			mount: async () => {
				await defer.promise;
				return 'mounted';
			},
			unmount: async () => {},
			afterMount: runAfterMount
		} );

		expect( runAfterMount ).not.toBeCalled();
		defer.resolve();

		await new Promise( resolve => setTimeout( resolve, 0 ) );

		expect( runAfterMount ).toHaveBeenCalledWith( {
			element: expect.any( HTMLElement ),
			mountResult: 'mounted'
		} );
	} );

	it( 'should release semaphore', () => {
		semaphore.release();
		expect( semaphore.value ).toBeNull();
	} );
} );
