/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { CKEditor, CKEditorContext } from '../dist/ckeditor.js';

describe( 'index.js - CKEditor', () => {
	it( 'should be a CKEditor Component', () => {
		expect( CKEditor ).to.be.a( 'function' );
	} );
} );

describe( 'index.js - CKEditorContext', () => {
	it( 'should be a CKEditorContext Component', () => {
		expect( CKEditorContext ).to.be.a( 'function' );
	} );
} );
