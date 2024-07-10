#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const parseArguments = require( './utils/parsearguments' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );

require( '@ckeditor/ckeditor5-dev-release-tools' ).generateChangelogForSinglePackage( {
	releaseBranch: cliArguments.branch
} );
