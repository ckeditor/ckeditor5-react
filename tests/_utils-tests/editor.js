/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
	} );

	describe( 'enableReadOnlyMode()', () => {
		it( 'should enable the read-only mode for given identifier', async () => {
			const editor = await Editor.create();

			expect( editor.isReadOnly ).is.false;

			editor.enableReadOnlyMode( 'foo', true );

			expect( editor.isReadOnly ).is.true;
		} );
	} );

	describe( 'disableReadOnlyMode()', () => {
		it( 'should enable the read-only mode for given lock identifier', async () => {
			const editor = await Editor.create();

			expect( editor.isReadOnly ).is.false;

			editor.enableReadOnlyMode( 'foo', true );

			expect( editor.isReadOnly ).is.true;

			editor.disableReadOnlyMode( 'foo' );

			expect( editor.isReadOnly ).is.false;
		} );
	} );

	describe( '#isReadOnly', () => {
		it( 'should be disabled by default when creating a new instance of the editor', () => {
			const editor = new Editor();

			expect( editor.isReadOnly ).is.false;
		} );

		it( 'should throw an error when using the setter for switching to read-only mode', async () => {
			const editor = await Editor.create();

			expect( () => {
				editor.isReadOnly = true;
			} ).to.throw( Error, 'Cannot use this setter anymore' );
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
