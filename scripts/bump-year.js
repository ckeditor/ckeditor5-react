#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/*

Usage:
node scripts/bump-year.js

And after reviewing the changes:
git commit -am "Internal: Bumped the year." && git push

*/

import { bumpYear } from '@ckeditor/ckeditor5-dev-bump-year';

bumpYear( {
	cwd: process.cwd(),
	globPatterns: [
		{ // LICENSE.md, .eslintrc.js, etc.
			pattern: '*',
			options: {
				dot: true
			}
		},
		{
			pattern: '!(coverage|.nyc_output|dist|demo-*)/**'
		},
		{
			pattern: '.husky/*'
		}
	]
} );
