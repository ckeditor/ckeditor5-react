/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from './editor';

/**
 * Mock of class that representing a basic, generic editor with the read-only lock mechanism introduced in the v34.0.0
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
 * @see: https://github.com/ckeditor/ckeditor5/pull/10496.
 */
export default class EditorReadOnlyLock extends Editor {
	initializeProperties() {
		this.model = Editor._model;
		this.editing = Editor._editing;
		this._readOnlyLocks = new Set();
		this.data = {
			get() {
				return '';
			},
			set() {

			}
		};
	}

	get isReadOnly() {
		return this._readOnlyLocks.size > 0;
	}

	set isReadOnly( value ) {
		throw new Error( 'Cannot use this setter anymore' );
	}

	enableReadOnlyMode( lockId, value ) {
		if ( value ) {
			this._readOnlyLocks.add( lockId );
		} else {
			this.disableReadOnlyMode( lockId );
		}
	}

	disableReadOnlyMode( lockId ) {
		this._readOnlyLocks.delete( lockId );
	}
}
