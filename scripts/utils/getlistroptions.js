/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

'use strict';

/**
 * @param {ReleaseOptions} cliArguments
 * @returns {Object}
 */
module.exports = function getListrOptions( cliArguments ) {
	return {
		renderer: cliArguments.verbose ? 'verbose' : 'default'
	};
};
