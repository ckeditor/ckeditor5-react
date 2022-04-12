/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Mock of class that representing a basic, generic editor.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
 */
export default class Editor {
	constructor() {
		this.initializeProperties();
	}

	initializeProperties() {
		this.model = Editor._model;
		this.editing = Editor._editing;
		this.data = {
			get() {
				return '';
			},
			set() {

			}
		};
		this._readOnlyLocks = new Set();
	}

	get isReadOnly() {
		return this._readOnlyLocks.size > 0;
	}

	set isReadOnly( value ) {
		throw new Error( 'Cannot use this setter anymore' );
	}

	enableReadOnlyMode( lockId ) {
		this._readOnlyLocks.add( lockId );
	}

	disableReadOnlyMode( lockId ) {
		this._readOnlyLocks.delete( lockId );
	}

	destroy() {
		return Promise.resolve();
	}

	// Implements the `DataApi` interface.
	// See: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html
	setData( ...args ) {
		return this.data.set.call( this, ...args );
	}
	getData( ...args ) {
		return this.data.get.call( this, ...args );
	}

	static create() {
		return Promise.resolve( new this() );
	}
}

// In order to tests events, we need to somehow mock those properties.
Editor._model = {
	document: createDocument()
};

Editor._editing = {
	view: {
		document: createDocument()
	}
};

function createDocument() {
	return {
		on() {},
		off() {},
		getRootNames() {
			return [ 'main' ];
		}
	};
}
