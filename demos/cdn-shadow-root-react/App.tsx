/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState, type ReactNode } from 'react';

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

			<p>
				Shadow root mode{ ' ' }
				<select
					value={ mode }
					onChange={ event => setMode( event.target.value as ShadowRootMode ) }
				>
					{ [ 'open', 'closed' ].map( item => (
						<option key={ item } value={ item }>{ item }</option>
					) ) }
				</select>
			</p>

			<CKEditorShadowRootCloudDemo
				key={ mode }
				mode={ mode }
				content={ EDITOR_CONTENT }
			/>
		</React.StrictMode>
	);
};
