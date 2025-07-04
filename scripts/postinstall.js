/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { existsSync } from 'fs';
import { ROOT_DIRECTORY } from './utils/constants.js';

main()
	.catch( err => {
		console.error( err );
	} );

async function main() {
	// When installing a repository as a dependency, the `.git` directory does not exist.
	// In such a case, husky should not attach its hooks as npm treats it as a package, not a git repository.
	if ( existsSync( upath.join( ROOT_DIRECTORY, '.git' ) ) ) {
		const { default: husky } = await import( 'husky' );

		husky();
	}
}
