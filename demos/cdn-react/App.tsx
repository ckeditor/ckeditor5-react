/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState, type ReactNode } from 'react';

import { CKEditorCloudDemo } from './CKEditorCloudDemo.js';
import { CKEditorCloudPluginsDemo } from './CKEditorCloudPluginsDemo.js';
import { CKEditorCKBoxCloudDemo } from './CKEditorCKBoxCloudDemo.js';
import { CKEditorCloudContextDemo } from './CKEditorCloudContextDemo.js';
import { CKEditorCloudLocalPluginsDemo } from './CKEditorCloudLocalPluginDemo.js';

const EDITOR_CONTENT = `
	<h2>Sample</h2>
	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">
	classic editor build</a>.
	</p>
	<figure class="image">
		<img src="/demos/sample.jpg" alt="CKEditor 5 Sample image." />
	</figure>
	<p>You can use this sample to validate whether your
	<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>
`;

const EDITOR_CONTENT_ELEMENTS = {
	Editor: <CKEditorCloudDemo content={ EDITOR_CONTENT } />,
	Context: <CKEditorCloudContextDemo />,
	CKBox: <CKEditorCKBoxCloudDemo content={ EDITOR_CONTENT } />,
	'Cloud Plugins': <CKEditorCloudPluginsDemo content={ EDITOR_CONTENT } />,
	'Cloud Local Plugins': <CKEditorCloudLocalPluginsDemo content={ EDITOR_CONTENT } />
};

type Demo = keyof typeof EDITOR_CONTENT_ELEMENTS;

export const App = (): ReactNode => {
	const [ currentDemo, setCurrentDemo ] = useState<Demo>( 'Editor' );
	const content = EDITOR_CONTENT_ELEMENTS[ currentDemo ];

	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – CDN demo</h1>

			<div className="buttons" style={ { textAlign: 'center' } }>
				{ Object.keys( EDITOR_CONTENT_ELEMENTS ).map( demo => (
					<button
						key={ demo }
						onClick={ () => setCurrentDemo( demo as Demo ) }
						disabled={ demo === currentDemo}
					>
						{ demo } demo
					</button>
				) ) }
			</div>

			{ content }
		</React.StrictMode>
	);
};
