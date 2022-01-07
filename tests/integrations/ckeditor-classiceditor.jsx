/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global ClassicEditor, window, document */

import React from 'react';
import ReactDOM from 'react-dom';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { CKEditor } from '../..';

configure( { adapter: new Adapter() } );

describe( 'CKEditor Component + ClassicEditor Build', () => {
	let wrapper;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	it( 'should initialize the ClassicEditor properly', async () => {
		await new Promise( res => {
			wrapper = mount( <CKEditor editor={ ClassicEditor } onReady={ res } /> );
		} );

		const component = wrapper.instance();

		expect( component.editor ).to.not.be.null;
		expect( component.editor.element ).to.not.be.null;
	} );
} );

// The memory test based on: https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-core/tests/_utils/memory.js.
// It's the simplified, adjusted version that allows checking whether the <CKEditor> component destroys all references.
const TEST_RETRIES = 2;
const TEST_TIMEOUT = 5000;
const GARBAGE_COLLECTOR_TIMEOUT = 500;

describe( '<CKEditor> memory usage', () => {
	const config = {
		initialData: '<h2>Editor 1</h2>\n' +
			'<p>This is an editor instance. And there\'s <a href="http://ckeditor.com">some link</a>.</p>'
	};

	let div;

	// Will skip test suite if tests are run inside incompatible environment:
	// - No window.gc (only Google Chrome).
	// - Chrome on Windows (tests heavily break).
	//
	// Currently on Google Chrome supports this method and must be run with proper flags:
	//
	// 		google-chrome -js-flags="--expose-gc"
	//
	before( function() {
		if ( !window.gc || isWindows() ) {
			this.skip();
		}
	} );

	// Single test case for memory usage test. Handles the memory leak test procedure.
	//
	// 1. Mount and unmount the <CKEditor> component to pre-fill the memory with some cacheable data.
	// 2. Record the heap size.
	// 3. Mount and unmount the <CKEditor> component 5 times.
	// 4. Record the heap size and compare with the previous result.
	// 5. Fail when exceeded a 1MB treshold (see code comments for why 1MB).
	it( 'should not grow on multiple component creations', function() {
		this.timeout( TEST_TIMEOUT );

		// Unfortunately the tests fails from time to time so retry a failed tests.
		this.retries( TEST_RETRIES );

		function createEditor() {
			div = document.createElement( 'div' );
			document.body.appendChild( div );

			return new Promise( res => {
				ReactDOM.render( <CKEditor editor={ ClassicEditor } config={ config } onReady={ res } />, div );
			} );
		}

		function destroyEditor() {
			return new Promise( res => {
				ReactDOM.unmountComponentAtNode( div );
				div.remove();

				res();
			} );
		}

		return runTest( createEditor, destroyEditor );
	} );

	// Runs a single test case.
	function runTest( createEditor, destroyEditor ) {
		let memoryAfterFirstStart;

		return Promise
			.resolve()
			// Initialize the first editor before measuring the heap size.
			// A cold start may allocate a bit of memory on the module-level.
			.then( createAndDestroy )
			.then( () => {
				return collectMemoryStats().then( mem => {
					memoryAfterFirstStart = mem;
				} );
			} )
			// Run create&destroy multiple times. Helps scaling up the issue.
			.then( createAndDestroy ) // #1
			.then( createAndDestroy ) // #2
			.then( createAndDestroy ) // #3
			.then( createAndDestroy ) // #4
			.then( createAndDestroy ) // #5
			.then( collectMemoryStats )
			.then( memory => {
				const memoryDifference = memory.usedJSHeapSize - memoryAfterFirstStart.usedJSHeapSize;
				// While theoretically we should get 0KB when there's no memory leak, in reality,
				// the results we get (when there are no leaks) vary from -500KB to 500KB (depending on which tests are executed).
				// However, when we had memory leaks, memoryDifference was reaching 20MB,
				// so, in order to detect significant memory leaks we can expect that the heap won't grow more than 1MB.
				expect( memoryDifference, 'used heap size should not grow' ).to.be.at.most( 1e6 );
			} );

		function createAndDestroy() {
			return Promise.resolve()
				.then( createEditor )
				.then( destroyEditor );
		}
	}

	function collectMemoryStats() {
		return new Promise( resolve => {
			// Enforce garbage collection before recording memory stats.
			window.gc();

			setTimeout( () => {
				const memeInfo = window.performance.memory;

				resolve( {
					totalJSHeapSize: memeInfo.totalJSHeapSize,
					usedJSHeapSize: memeInfo.usedJSHeapSize,
					jsHeapSizeLimit: memeInfo.jsHeapSizeLimit
				} );
			}, GARBAGE_COLLECTOR_TIMEOUT );
		} );
	}

	// The windows environment does not cooperate with this tests.
	function isWindows() {
		const userAgent = window.navigator.userAgent.toLowerCase();

		return userAgent.indexOf( 'windows' ) > -1;
	}
} );
