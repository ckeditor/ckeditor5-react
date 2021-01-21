
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

export default class ContextMock {
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
