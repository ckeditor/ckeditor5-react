/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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

	destroy() {
		return Promise.resolve();
	}
}
