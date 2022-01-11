#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

require( '@ckeditor/ckeditor5-dev-env' )
	.releaseSubRepositories( {
		cwd: process.cwd(),
		packages: null,
		dryRun: process.argv.includes( '--dry-run' )
	} );
