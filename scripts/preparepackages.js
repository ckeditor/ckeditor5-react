#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Listr } from 'listr2';
import * as releaseTools from '@ckeditor/ckeditor5-dev-release-tools';
import * as devUtils from '@ckeditor/ckeditor5-dev-utils';
import parseArguments from './utils/parsearguments.mjs';
import getListrOptions from './utils/getlistroptions.js';
import { preparePackageJson } from './utils/preparepackagejson.js';

const latestVersion = releaseTools.getLastFromChangelog();
const versionChangelog = releaseTools.getChangesForVersion( latestVersion );
const cliArguments = parseArguments( process.argv.slice( 2 ) );

const tasks = new Listr( [
	{
		title: 'Verifying the repository.',
		task: async () => {
			const errors = await releaseTools.validateRepositoryToRelease( {
				version: latestVersion,
				changes: versionChangelog,
				branch: cliArguments.branch
			} );

			if ( !errors.length ) {
				return;
			}

			return Promise.reject( 'Aborted due to errors.\n' + errors.map( message => `* ${ message }` ).join( '\n' ) );
		},
		skip: () => {
			// When compiling the packages only, do not validate the release.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	},
	{
		title: 'Updating the `#version` field.',
		task: () => {
			return releaseTools.updateVersions( {
				version: latestVersion
			} );
		},
		skip: () => {
			// When compiling the packages only, do not update any values.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	},
	{
		title: 'Running build command.',
		task: () => {
			return devUtils.tools.shExec( 'yarn run build', { async: true, verbosity: 'silent' } );
		}
	},
	{
		title: 'Creating the `ckeditor5-react` package in the release directory.',
		task: async () => {
			return releaseTools.prepareRepository( {
				outputDirectory: 'release',
				rootPackageJson: await preparePackageJson()
			} );
		}
	},
	{
		title: 'Cleaning-up.',
		task: () => {
			return releaseTools.cleanUpPackages( {
				packagesDirectory: 'release'
			} );
		}
	},
	{
		title: 'Commit & tag.',
		task: () => {
			return releaseTools.commitAndTag( {
				version: latestVersion,
				files: [
					'package.json'
				]
			} );
		},
		skip: () => {
			// When compiling the packages only, do not update any values.
			if ( cliArguments.compileOnly ) {
				return true;
			}

			return false;
		}
	}
], getListrOptions( cliArguments ) );

tasks.run()
	.catch( err => {
		process.exitCode = 1;

		console.log( '' );
		console.error( err );
	} );
