/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { fileURLToPath } from 'node:url';
import upath from 'upath';

const __filename = fileURLToPath( import.meta.url );
const __dirname = upath.dirname( __filename );

export const RELEASE_DIRECTORY = 'release';
export const ROOT_DIRECTORY = upath.join( __dirname, '..', '..' );
