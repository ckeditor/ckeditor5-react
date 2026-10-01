/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState, type ReactNode } from 'react';

import { ShadowRootModeSelect } from '../shared/components/ShadowRootModeSelect.js';
import { CKEditorShadowRootCloudDemo } from './CKEditorShadowRootCloudDemo.js';

const EDITOR_CONTENT = `
	<h2>Sample</h2>
	<p>This editor is rendered inside a shadow root, and so are its stylesheets.</p>
	<p>Switch the mode above to check that both an open and a closed shadow root work the same.</p>
`;

export const App = (): ReactNode => {
	const [ mode, setMode ] = useState<ShadowRootMode>( 'open' );

	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – shadow root CDN demo</h1>

			<ShadowRootModeSelect value={ mode } onChange={ setMode } />

			<CKEditorShadowRootCloudDemo
				key={ mode }
				mode={ mode }
				content={ EDITOR_CONTENT }
			/>
		</React.StrictMode>
	);
};
