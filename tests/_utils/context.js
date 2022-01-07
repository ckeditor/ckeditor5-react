/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Mock of class that representing the Context feature.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html
 */
export default class ContextMock {
	constructor( config ) {
		this.config = config;
	}

	static create( config ) {
		return Promise.resolve( new ContextMock( config ) );
	}

	static destroy() {
		return Promise.resolve();
	}

	destroy() {
		return Promise.resolve();
	}
}
