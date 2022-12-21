#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

/*

Usage:
node scripts/bump-year.js

And after reviewing the changes:
git commit -am "Internal: Bumped the year." && git push

*/

require( '@ckeditor/ckeditor5-dev-bump-year' )
	.bumpYear( {
		cwd: process.cwd(),
		globPatterns: [
			{ // LICENSE.md, .eslintrc.js, etc.
				pattern: '*',
				options: {
					dot: true
				}
			},
			{
				pattern: '!(coverage|.nyc_output|dist)/**'
			}
		]
	} );
