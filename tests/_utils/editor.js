/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import { EditorWatchdog, ContextWatchdog } from 'ckeditor5';

/**
 * Mock of class that representing a basic, generic editor.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
 */
export default class Editor {
	constructor( element, config ) {
		this.element = element;
		this.config = config;

		this.initializeProperties();
	}

	initializeProperties() {
		this.model = Editor._model;
		this.editing = Editor._editing;
		this.on = Editor._on;
		this.data = {
			get() {
				return '';
			},
			set() {

			}
		};
		this.createEditable = () => document.createElement( 'div' );
		this.ui = {
			getEditableElement() {
				return document.createElement( 'div' );
			}
		};
		this.plugins = new Set();
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

	detachEditable() {
		return Promise.resolve();
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

	static create( element, config ) {
		return Promise.resolve( new this( element, config ) );
	}
}

Editor.EditorWatchdog = EditorWatchdog;
Editor.ContextWatchdog = ContextWatchdog;

// In order to tests events, we need to somehow mock those properties.
Editor._on = () => {};

Editor._model = {
	document: createDocument(),
	markers: []
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
		},
		differ: {
			getChanges() {
				return [];
			},
			getChangedRoots() {
				return [];
			}
		},
		roots: {
			filter() {
				return [ {
					getAttributes: () => {
						return {};
					},
					getChildren: () => {
						return [];
					},
					_isLoaded: false
				} ];
			}
		}
	};
}
