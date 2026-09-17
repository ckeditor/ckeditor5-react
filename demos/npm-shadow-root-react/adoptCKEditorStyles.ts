/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ckeditorStyles from 'ckeditor5/ckeditor5.css?inline';

let styleSheet: CSSStyleSheet | null = null;

/**
 * Returns the editor styles as a constructed stylesheet, built once and shared by everything that
 * adopts it. The editor declares its custom properties for both `:root` and `:host`, so the same
 * sheet works in the document and inside a shadow root.
 */
function getCKEditorStyleSheet(): CSSStyleSheet {
	if ( !styleSheet ) {
		styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync( ckeditorStyles );
	}

	return styleSheet;
}

/**
 * Adopts the editor styles in the given root, unless they are already there.
 *
 * Both roots need them: the editor UI itself lives in the shadow root, while balloons, dropdown
 * panels and the powered-by badge are appended to `document.body` by the editor's body collection.
 *
 * @param root The document or shadow root to adopt the styles in.
 */
export function adoptCKEditorStyles( root: DocumentOrShadowRoot ): void {
	const sheet = getCKEditorStyleSheet();

	if ( !root.adoptedStyleSheets.includes( sheet ) ) {
		root.adoptedStyleSheets = [ ...root.adoptedStyleSheets, sheet ];
	}
}
