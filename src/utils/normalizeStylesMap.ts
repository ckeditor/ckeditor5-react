/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { kebabToCamelCase, mapObjectKeys } from '@ckeditor/ckeditor5-integrations-common';

/**
 * Transforms styles
 */
export function normalizeStylesMap( styles: Record<string, string> ): Record<string, string> {
	return mapObjectKeys( styles, key => {
		if ( key.startsWith( '--' ) ) {
			return key;
		}

		return kebabToCamelCase( key );
	} );
}
