/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

import minimist from 'minimist';

/**
 * @param {Array.<String>} cliArguments
 * @returns {ReleaseOptions} options
 */
export default function parseArguments( cliArguments ) {
	const config = {
		string: [
			'npm-tag'
		],

		default: {
			'npm-tag': 'latest'
		}
	};

	const options = minimist( cliArguments, config );

	options.npmTag = options[ 'npm-tag' ];
	delete options[ 'npm-tag' ];

	return options;
}

/**
 * @typedef {Object} ReleaseOptions
 *
 * @property {Array.<String>|null} packages
 */
