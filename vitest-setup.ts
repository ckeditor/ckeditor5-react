/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach } from 'vitest';

declare global {
	interface Window {
		CKEDITOR_GLOBAL_LICENSE_KEY: string;
	}
}

window.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';

beforeEach( cleanup );
afterEach( cleanup );
