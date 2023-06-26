#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

const { Listr } = require( 'listr2' );
const releaseTools = require( '@ckeditor/ckeditor5-dev-release-tools' );
const { provideToken } = require( '@ckeditor/ckeditor5-dev-release-tools/lib/utils/cli' );
const parseArguments = require( './utils/parsearguments' );

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const latestVersion = releaseTools.getLastFromChangelog();
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );

let githubToken;

const tasks = new Listr( [
	{
		title: 'Publishing packages.',
		task: async ( _, task ) => {
			return releaseTools.publishPackages( {
				packagesDirectory: 'release',
				npmOwner: 'ckeditor',
				npmTag: cliArguments.npmTag,
				listrTask: task,
				confirmationCallback: () => {
					return task.prompt( { type: 'Confirm', message: 'Do you want to continue?' } );
				}
			} );
		},
		retry: 3
	},
	{
		title: 'Pushing changes.',
		task: () => {
			return releaseTools.push( {
				releaseBranch: 'master',
				version: latestVersion
			} );
		}
	},
	{
		title: 'Creating the release page.',
		task: async ( _, task ) => {
			const releaseUrl = await releaseTools.createGithubRelease( {
				token: githubToken,
				version: latestVersion,
				description: versionChangelog
			} );

			task.output = `Release page: ${ releaseUrl }`;
		}
	}
] );

( async () => {
	try {
		githubToken = await provideToken();

		await tasks.run();
	} catch ( err ) {
		console.error( err );
	}
} )();
