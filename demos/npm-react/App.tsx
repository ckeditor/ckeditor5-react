/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useState } from 'react';
import EditorDemo from './EditorDemo.js';
import ContextDemo from './ContextDemo.js';

type Demo = 'editor' | 'context';

const editorContent = `
	<h2>Sample</h2>
	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html">
	classic editor build</a>.
	</p>
	<figure class="image">
		<img src="/demos/sample.jpg" alt="CKEditor 5 Sample image." />
	</figure>
	<p>
		You can use
		<a href="https://ckeditor.com/ckeditor-5/builder/">CKEditor Builder</a>
		to create a custom build with your favorite features.
	</p>
`;

export default function App(): JSX.Element {
	const [ demo, setDemo ] = useState<Demo>( 'editor' );

	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – development sample</h1>

			<div className="buttons" style={ { textAlign: 'center' } }>
				<button
					onClick={ () => setDemo( 'editor' ) }
					disabled={ demo == 'editor' }
				>
					Editor demo
				</button>

				<button
					onClick={ () => setDemo( 'context' ) }
					disabled={ demo == 'context' }
				>
					Context demo
				</button>
			</div>
			{
				demo == 'editor' ?
					<EditorDemo content={editorContent}/> :
					<ContextDemo content={editorContent}/>
			}
		</React.StrictMode>
	);
}
