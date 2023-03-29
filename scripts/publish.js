#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const minimist = require( 'minimist' );

const argv = minimist( process.argv.slice( 2 ), {
	string: [
		'npm-tag'
	]
} );

require( '@ckeditor/ckeditor5-dev-release-tools' )
	.releaseSubRepositories( {
		cwd: process.cwd(),
		packages: null,
		npmTag: argv[ 'npm-tag' ],
		dryRun: process.argv.includes( '--dry-run' )
	} );
