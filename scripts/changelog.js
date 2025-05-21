#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { generateChangelogForSinglePackage } from '@ckeditor/ckeditor5-dev-release-tools';
import parseArguments from './utils/parsearguments.js';

const cliArguments = parseArguments( process.argv.slice( 2 ) );

generateChangelogForSinglePackage( {
	from: cliArguments.from,
	releaseBranch: cliArguments.branch
} );
