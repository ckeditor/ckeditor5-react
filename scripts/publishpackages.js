#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import { Listr } from 'listr2';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import parseArguments from './utils/parsearguments.js';
import getListrOptions from './utils/getlistroptions.js';

const cliArguments = parseArguments( process.argv.slice( 2 ) );
const latestVersion = releaseTools.getLastFromChangelog();
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );

let githubToken;

if ( !cliArguments.npmTag ) {
	cliArguments.npmTag = releaseTools.getNpmTagFromVersion( latestVersion );
}

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
					if ( cliArguments.ci ) {
						return true;
					}

					return task.prompt( { type: 'Confirm', message: 'Do you want to continue?' } );
				}
			} );
		}
	},
	{
		title: 'Pushing changes.',
		task: () => {
			return releaseTools.push( {
				releaseBranch: cliArguments.branch,
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
		},
		options: {
			persistentOutput: true
		}
	}
], getListrOptions( cliArguments ) );

( async () => {
	try {
		if ( process.env.CKE5_RELEASE_TOKEN ) {
			githubToken = process.env.CKE5_RELEASE_TOKEN;
		} else {
			githubToken = await releaseTools.provideToken();
		}

		await tasks.run();
	} catch ( err ) {
		process.exitCode = 1;

		console.error( err );
	}
} )();
