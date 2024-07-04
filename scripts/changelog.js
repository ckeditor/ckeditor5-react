#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

/**
 * Scripts for generating the changelog before starting the release process.
 */

import { generateChangelogForSinglePackage } from '@ckeditor/ckeditor5-dev-release-tools';

generateChangelogForSinglePackage();
