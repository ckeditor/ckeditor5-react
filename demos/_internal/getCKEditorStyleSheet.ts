/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ckeditorStyles from 'ckeditor5/ckeditor5.css?inline';

let styleSheet: CSSStyleSheet | null = null;

/**
 * Returns the editor styles as a constructed stylesheet, built once and shared by everything that adopts it.
 */
export function getCKEditorStyleSheet(): CSSStyleSheet {
	if ( !styleSheet ) {
		styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync( ckeditorStyles );
	}

	return styleSheet;
}
