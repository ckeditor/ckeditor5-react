/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState } from 'react';
import EditorDemo from './EditorDemo';
import ContextDemo from './ContextDemo';

type Demo = 'editor' | 'context';

const editorContent = `
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
