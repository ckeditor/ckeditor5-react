#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

import { createRequire } from 'module';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';

const require = createRequire( import.meta.url );
const { name: packageName } = require( '../../package.json' );

const changelogVersion = releaseTools.getLastFromChangelog();
const npmTag = releaseTools.getNpmTagFromVersion( changelogVersion );

releaseTools.isVersionPublishableForTag( packageName, changelogVersion, npmTag )
	.then( result => {
		if ( !result ) {
			console.error( `The proposed changelog (${ changelogVersion }) version is not higher than the already published one.` );
			process.exit( 1 );
		} else {
			console.log( 'The project is ready to release.' );
		}
	} );
