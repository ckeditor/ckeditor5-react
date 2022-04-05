/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditorReadOnlyLock from '../_utils/editorreadonlylock';

describe( 'EditorReadOnlyLock', () => {
	describe( 'constructor()', () => {
		it( 'defines a model and view layers', () => {
			const editor = new EditorReadOnlyLock();

			expect( editor.model ).is.not.undefined;
			expect( editor.editing ).is.not.undefined;
		} );

		it( 'read-only mode is disabled by default', () => {
			const editor = new EditorReadOnlyLock();

			expect( editor.isReadOnly ).is.false;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should return a promise that resolves properly', () => {
			return EditorReadOnlyLock.create()
				.then( editor => {
					const promise = editor.destroy();

					expect( promise ).to.be.an.instanceof( Promise );

					return promise;
				} );
		} );
	} );

	describe( 'create()', () => {
		it( 'should return a promise that resolves properly', () => {
			const promise = EditorReadOnlyLock.create();

			expect( promise ).to.be.an.instanceof( Promise );

			return promise;
		} );
	} );

	describe( 'enableReadOnlyMode()', () => {
		it( 'should enable the read-only mode for given identifier when passing "true" as the second argument', async () => {
			const editor = await EditorReadOnlyLock.create();

			expect( editor.isReadOnly ).is.false;

			editor.enableReadOnlyMode( 'foo', true );

			expect( editor.isReadOnly ).is.true;
		} );

		it( 'should disable the read-only mode for given identifier when passing "false" as the second argument', async () => {
			const editor = await EditorReadOnlyLock.create();

			expect( editor.isReadOnly ).is.false;

			editor.enableReadOnlyMode( 'foo', false );

			expect( editor.isReadOnly ).is.false;
		} );
	} );

	describe( 'disableReadOnlyMode()', () => {
		it( 'should enable the read-only mode for given lock identifier', async () => {
			const editor = await EditorReadOnlyLock.create();

			expect( editor.isReadOnly ).is.false;

			editor.enableReadOnlyMode( 'foo', true );

			expect( editor.isReadOnly ).is.true;

			editor.disableReadOnlyMode( 'foo' );

			expect( editor.isReadOnly ).is.false;
		} );
	} );

	describe( '#isReadOnly', () => {
		it( 'should throw an error when using the setter for switching to read-only mode', async () => {
			const editor = await EditorReadOnlyLock.create();

			expect( () => {
				editor.isReadOnly = true;
			} ).to.throw( Error, 'Cannot use this setter anymore' );
		} );
	} );

	describe( 'DataApi interface', () => {
		it( 'setData() is defined', () => {
			return EditorReadOnlyLock.create()
				.then( editor => {
					expect( editor.setData ).is.a( 'function' );
				} );
		} );

		it( 'getData() is defined', () => {
			return EditorReadOnlyLock.create()
				.then( editor => {
					expect( editor.getData ).is.a( 'function' );
				} );
		} );
	} );
} );
