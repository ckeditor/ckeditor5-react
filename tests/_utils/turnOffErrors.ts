/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { Awaitable } from '@ckeditor/ckeditor5-integrations-common';

export async function turnOffErrors( callback: () => Awaitable<void> ): Promise<void> {
	const handler = ( evt: ErrorEvent ) => {
		evt.preventDefault();
	};

	window.addEventListener( 'error', handler, { capture: true, once: true } );

	try {
		await callback();
	} finally {
		window.removeEventListener( 'error', handler );
	}
}
