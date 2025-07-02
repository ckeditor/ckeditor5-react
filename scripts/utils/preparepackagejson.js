/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export async function preparePackageJson() {
	const { default: packageJson } = await import( '../../package.json', { with: { type: 'json' } } );

	if ( packageJson.engines ) {
		delete packageJson.engines;
	}

	return packageJson;
}
