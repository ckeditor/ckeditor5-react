/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { useMemo } from 'react';

export function useCollaborationCredentials(): CollaborationCredentials {
	return useMemo( () => {
		const LICENSE_KEY = import.meta.env.VITE_CKE_LICENSE_KEY;
		const TOKEN_URL = import.meta.env.VITE_CKE_TOKEN_URL;
		const WEBSOCKET_URL = import.meta.env.VITE_CKE_WEBSOCKET_URL;
		const CLOUD_SERVICE_UPLOAD_URL = import.meta.env.VITE_CKE_UPLOAD_URL;

		const MISSING = (
			[
				[ 'VITE_CKE_LICENSE_KEY', LICENSE_KEY ],
				[ 'VITE_CKE_TOKEN_URL', TOKEN_URL ],
				[ 'VITE_CKE_WEBSOCKET_URL', WEBSOCKET_URL ]
			] satisfies Array<[ string, string ]>
		).filter( ( [ , v ] ) => !v ).map( ( [ k ] ) => k );

		if ( MISSING.length ) {
			throw new Error(
				`[RTCEditor] Missing required env variables:\n  ${ MISSING.join( '\n  ' ) }\n` +
				'Copy .env.example to .env.local and fill in the values.'
			);
		}

		return {
			licenseKey: LICENSE_KEY,
			tokenUrl: TOKEN_URL,
			websocketUrl: WEBSOCKET_URL,
			cloudServiceUploadUrl: CLOUD_SERVICE_UPLOAD_URL
		};
	}, [] );
}

type CollaborationCredentials = {
	licenseKey: string;
	tokenUrl: string;
	websocketUrl: string;
	cloudServiceUploadUrl: string;
};
