/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { expect } from 'vitest';

export function expectToBeTruthy<T>(
	value: T | undefined | null
): asserts value is T {
	expect( value ).to.be.toBeTruthy();
}
