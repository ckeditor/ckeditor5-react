/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { useMemo } from 'react';

export function useCollaborationChannelId(): string {
	return useMemo( () => {
		const params = new URLSearchParams( window.location.search );
		const existing = params.get( 'channelId' );

		if ( existing ) {
			return existing;
		}

		const id = crypto.randomUUID();
		params.set( 'channelId', id );

		window.history.replaceState( null, '', `?${ params.toString() }` );

		return id;
	}, [] );
}
