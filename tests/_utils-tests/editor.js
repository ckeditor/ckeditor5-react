/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../_utils/editor';

describe( 'Editor', () => {
	describe( 'constructor()', () => {
		it( 'defines a model and view layers', () => {
			const editor = new Editor();

			expect( editor.model ).is.not.undefined;
			expect( editor.editing ).is.not.undefined;
		} );

		it( 'read-only mode is disabled by default', () => {
			const editor = new Editor();

			expect( editor.isReadOnly ).is.false;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should return a promise that resolves properly', () => {
			return Editor.create()
				.then( editor => {
					const promise = editor.destroy();

					expect( promise ).to.be.an.instanceof( Promise );

					return promise;
				} );
		} );
	} );

	describe( 'create()', () => {
		it( 'should return a promise that resolves properly', () => {
			const promise = Editor.create();

			expect( promise ).to.be.an.instanceof( Promise );

			return promise;
		} );
	} );

	describe( 'DataApi interface', () => {
		it( 'setData() is defined', () => {
			return Editor.create()
				.then( editor => {
					expect( editor.setData ).is.a( 'function' );
				} );
		} );

		it( 'getData() is defined', () => {
			return Editor.create()
				.then( editor => {
					expect( editor.getData ).is.a( 'function' );
				} );
		} );
	} );
} );
