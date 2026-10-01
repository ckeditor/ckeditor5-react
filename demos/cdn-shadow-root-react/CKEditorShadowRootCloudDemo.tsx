/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';

import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { ShadowRootHost } from '../shared/components/ShadowRootHost.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorShadowRootCloudDemoProps = {
	content: string;
	mode: ShadowRootMode;
};

/**
 * Renders the editor inside a shadow root and asks the loader to inject the editor stylesheets there
 * instead of `document.head`.
 */
export const CKEditorShadowRootCloudDemo = ( { content, mode }: CKEditorShadowRootCloudDemoProps ): ReactNode => (
	<ShadowRootHost key={ mode } mode={ mode }>
		{ shadowRoot => <ShadowRootEditor shadowRoot={ shadowRoot } content={ content } /> }
	</ShadowRootHost>
);

/**
 * Loads the bundles into the given shadow root and creates the editor in it.
 */
function ShadowRootEditor( { shadowRoot, content }: { shadowRoot: ShadowRoot; content: string } ): ReactNode {
	const cloud = useCKEditorCloud( {
		version: 'nightly',
		injectedStylesheetsLocation: {
			targetNode: shadowRoot,
			placement: 'end'
		}
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );

		return <div>Error!</div>;
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = getCKCdnClassicEditor( {
		cloud,
		overrideConfig: {
			licenseKey: import.meta.env.CKEDITOR_LICENSE_KEY ?? 'GPL'
		}
	} );

	return (
		<CKEditor
			editor={ CKEditorClassic }
			data={ content }
			disableWatchdog
		/>
	);
}
