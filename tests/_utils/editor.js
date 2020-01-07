/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Mock of class that representing a basic, generic editor.
 *
 * @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
 */
export default class Editor {
	constructor() {
		this.model = Editor._model;
		this.editing = Editor._editing;
		this.isReadOnly = false;
	}

	destroy() {
		return Promise.resolve();
	}

	// Implements the `DataApi` interface.
	// See: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html
	setData() {}
	getData() {}

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
		on() {}
	};
}
