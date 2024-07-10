#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const { execSync } = require( 'child_process' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const semver = require( 'semver' );
const { name } = require( '../../package.json' );

const latestPublishedVersion = execSync( `npm view ${ name }@latest version`, { encoding: 'utf-8' } ).trim();
const changelogVersion = releaseTools.getLastFromChangelog();

if ( getVersionTag( changelogVersion ) !== 'latest' ) {
	console.log( `Aborting due non-latest changelog version (${ changelogVersion }).` );
	process.exit( 1 );
}

if ( semver.lte( changelogVersion, latestPublishedVersion ) ) {
	console.log(
		`The proposed changelog (${ changelogVersion }) version is not greater than the published one (${ latestPublishedVersion }).`
	);
	process.exit( 1 );
}

console.log( 'The project is ready to release.' );

/**
 * Returns an npm tag based on the specified release version.
 *
 * @param {String} version
 * @returns {String}
 */
function getVersionTag( version ) {
	const [ versionTag ] = semver.prerelease( version ) || [ 'latest' ];

	return versionTag;
}
