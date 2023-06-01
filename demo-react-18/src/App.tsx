import React, { useState } from 'react';
import EditorDemo from './EditorDemo';
import ContextDemo from './ContextDemo';
import MultiRootEditorDemo from './MultiRootEditorDemo';

type Demo = 'editor' | 'context' | 'multiRoot';

const editorContent = `
	<h2>Sample</h2>
	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">
	classic editor build</a>.
	</p>
	<figure class="image">
		<img src="/sample.jpg" alt="CKEditor 5 Sample image." />
	</figure>
	<p>You can use this sample to validate whether your
	<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>
`;

const multiRootEditorContent = {
	intro: '<h2>Sample</h2><p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">classic editor build</a>.</p>',
	content: '<p>It is the custom content</p><figure class="image"><img src="/sample.jpg" alt="CKEditor 5 Sample image."></figure>',
	outro: '<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>'
};

const rootsAttributes = {
	intro: {
		section: 'section-1'
	},
	content: {
		section: 'section-1'
	},
	outro: {
		section: 'section-2'
	}
};

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

				<button
					onClick={ () => setDemo( 'multiRoot' ) }
					disabled={ demo == 'multiRoot' }
				>
					Multi root editor demo
				</button>
			</div>

			<MultiRootEditorDemo content={multiRootEditorContent} rootsAttributes={rootsAttributes} />
		</React.StrictMode>
	);
}
