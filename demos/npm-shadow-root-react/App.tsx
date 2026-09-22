/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState, type ReactNode } from 'react';

import { ShadowRootModeSelect } from '../shared/components/ShadowRootModeSelect.js';
import { CKEditorShadowRootDemo } from './CKEditorShadowRootDemo.js';

const EDITOR_CONTENT = `
	<h2>Sample</h2>
	<p>This editor is rendered inside a shadow root and styled with a constructed stylesheet.</p>
	<p>Open a toolbar dropdown to check that the body collection is scoped to the same root.</p>
`;

export const App = (): ReactNode => {
	const [ mode, setMode ] = useState<ShadowRootMode>( 'open' );

	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – npm shadow root demo</h1>

			<ShadowRootModeSelect value={ mode } onChange={ setMode } />

			<CKEditorShadowRootDemo
				mode={ mode }
				content={ EDITOR_CONTENT }
			/>
		</React.StrictMode>
	);
};
