/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { once } from '@ckeditor/ckeditor5-integrations-common';
import ckeditorStyles from 'ckeditor5/ckeditor5.css?inline';

/**
 * Returns the editor styles as a constructed stylesheet, built once and shared by everything that adopts it.
 */
export const getCKEditorStyleSheet = once( (): CSSStyleSheet => {
	const styleSheet = new CSSStyleSheet();

	styleSheet.replaceSync( ckeditorStyles );

	return styleSheet;
} );
