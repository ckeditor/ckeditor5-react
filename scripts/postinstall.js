/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const ROOT_DIRECTORY = join(
	dirname( fileURLToPath( import.meta.url ) ),
	'..'
);

main()
	.catch( err => {
		console.error( err );
	} );

async function main() {
	// When installing a repository as a dependency, the `.git` directory does not exist.
	// In such a case, husky should not attach its hooks as npm treats it as a package, not a git repository.
	if ( existsSync( join( ROOT_DIRECTORY, '.git' ) ) ) {
		const { install } = await import( 'husky' );

		install();
	}
}
