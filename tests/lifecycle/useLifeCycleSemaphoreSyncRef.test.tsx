/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { LifeCycleElementSemaphore } from '../../src/lifecycle/LifeCycleElementSemaphore.js';
import { useLifeCycleSemaphoreSyncRef } from '../../src/lifecycle/useLifeCycleSemaphoreSyncRef.js';

describe( 'useLifeCycleSemaphoreSyncRef', () => {
	let semaphore: LifeCycleElementSemaphore<any>;

	beforeEach( () => {
		semaphore = new LifeCycleElementSemaphore<any>( document.createElement( 'div' ), {
			mount: async () => {},
			unmount: async () => {}
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.clearAllTimers();
	} );

	it( 'should initialize with null semaphore', () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef() );

		expect( result.current.current ).toBeNull();
	} );

	it( 'should create attribute ref with null value if semaphore is not assigned', () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );
		const attributeRef = result.current.createAttributeRef( 'key' );

		expect( attributeRef.current ).toBeNull();
	} );

	it( 'should set proper value and refresh if semaphore is assigned', () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );

		act( () => {
			result.current.replace( () => semaphore );
			result.current.unsafeSetValue( { key: 'value' } );
		} );

		expect( result.current.current?.value ).toEqual( { key: 'value' } );
		expect( result.current.revision ).not.toBeNaN();
	} );

	it( 'should not execute callback passed to `runAfterMount` if semaphore didn\'t resolve anything', async () => {
		const runAfterMountSpy = vi.fn();
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef() );

		act( () => {
			result.current.replace( () => semaphore );
			result.current.runAfterMount( runAfterMountSpy );
		} );

		await new Promise( resolve => setTimeout( resolve, 30 ) );

		expect( runAfterMountSpy ).not.toHaveBeenCalled();
	} );

	it( 'should execute callback passed to `runAfterMount` if semaphore resolved value', async () => {
		const runAfterMountSpy = vi.fn();
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );

		act( () => {
			result.current.replace( () => semaphore );
			result.current.unsafeSetValue( { key: 'value' } );
			result.current.runAfterMount( runAfterMountSpy );
		} );

		await new Promise( resolve => setTimeout( resolve, 30 ) );

		expect( runAfterMountSpy ).toHaveBeenCalledWith( { key: 'value' } );
	} );

	it( 'should reset semaphore and refresh when `release` is called', async () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );

		act( () => {
			result.current.replace( () => semaphore );
			result.current.unsafeSetValue( { key: 'value' } );
		} );

		const currentRevision = result.current.revision;

		await new Promise( resolve => setTimeout( resolve, 30 ) );

		act( () => {
			result.current.release();
		} );

		expect( result.current.current ).toBeNull();
		expect( result.current.revision ).to.be.greaterThan( currentRevision );
	} );

	it( 'should create new revision if semaphore is replaced', async () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );
		const currentRevision = result.current.revision;

		await new Promise( resolve => setTimeout( resolve, 30 ) );

		act( () => {
			result.current.replace( () => semaphore );
		} );

		expect( result.current.revision ).to.be.greaterThan( currentRevision );
	} );

	it( 'should bind semaphore values to attribute refs', () => {
		const { result } = renderHook( () => useLifeCycleSemaphoreSyncRef<{ key: string }>() );
		const attributeRef = result.current.createAttributeRef( 'key' );

		expect( attributeRef.current ).toBeNull();

		act( () => {
			result.current.replace( () => semaphore );
			result.current.unsafeSetValue( { key: 'value' } );
		} );

		expect( attributeRef.current ).toBe( 'value' );
	} );
} );
