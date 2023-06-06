import React from 'react';
import MultiRootEditorDemo from './MultiRootEditorDemo';

const multiRootEditorContent = {
	intro: '<h2>Sample</h2><p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">multi-root editor build</a>.</p>',
	content: '<p>It is the custom content</p><figure class="image"><img src="/sample.jpg" alt="CKEditor 5 Sample image."></figure>',
	outro: '<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>'
};

const rootsAttributes = {
	intro: {
		section: 'section-1',
		order: 10
	},
	content: {
		section: 'section-1',
		order: 20
	},
	outro: {
		section: 'section-2',
		order: 10
	}
};

export default function App(): JSX.Element {
	return (
		<React.StrictMode>
			<h1>CKEditor 5 – React Component – development sample</h1>

			<MultiRootEditorDemo content={multiRootEditorContent} rootsAttributes={rootsAttributes} />
		</React.StrictMode>
	);
}
