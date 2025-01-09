/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Awaitable } from '@ckeditor/ckeditor5-integrations-common';
import { timeout } from './timeout.js';

export async function turnOffErrors( callback: () => Awaitable<void> ): Promise<void> {
	const handler = ( evt: ErrorEvent ) => {
		evt.preventDefault();
	};

	window.addEventListener( 'error', handler, { capture: true, once: true } );

	try {
		await callback();
		await timeout( 150 );
	} finally {
		window.removeEventListener( 'error', handler );
	}
}
