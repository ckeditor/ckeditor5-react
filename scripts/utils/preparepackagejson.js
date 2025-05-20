/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import packageJson from '../../package.json' with { type: 'json' };

export function preparePackageJson() {
	if ( packageJson.engines ) {
		delete packageJson.engines;
	}

	return packageJson;
}
