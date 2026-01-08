#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

'use strict';

import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import pkg from '../../package.json' with { type: 'json' };

const changelogVersion = releaseTools.getLastFromChangelog();
const npmTag = releaseTools.getNpmTagFromVersion( changelogVersion );

releaseTools.isVersionPublishableForTag( pkg.name, changelogVersion, npmTag )
	.then( result => {
		if ( !result ) {
			console.error( `The proposed changelog (${ changelogVersion }) version is not higher than the already published one.` );
			process.exit( 1 );
		} else {
			console.log( 'The project is ready to release.' );
		}
	} );
