import React, { StrictMode, useState } from 'react';
import MultiRootEditorDemo from './MultiRootEditorDemo';
import MultiRootEditorRichDemo from './MultiRootEditorRichDemo';
import ContextMultiRootEditorDemo from './ContextMultiRootEditorDemo';

type Demo = 'editor' | 'rich' | 'context';

const multiRootEditorContent = {
	intro: '<h2>Sample</h2><p>This is an instance of the ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">multi-root editor build</a>.</p>',
	content: '<p>It is the custom content</p><figure class="image"><img src="/sample.jpg" alt="CKEditor 5 Sample image."></figure>',
	outro: '<p>You can use this sample to validate whether your ' +
		'<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>'
};

const rootsAttributes = {
	intro: {
		row: '1',
		order: 10
	},
	content: {
		row: '1',
		order: 20
	},
	outro: {
		row: '2',
		order: 10
	}
};

export default function App(): JSX.Element {
	const [ demo, setDemo ] = useState<Demo>( 'editor' );

	const renderDemo = () => {
		switch ( demo ) {
			case 'context':
				return <ContextMultiRootEditorDemo />;
			case 'editor':
				return <MultiRootEditorDemo data={multiRootEditorContent} rootsAttributes={rootsAttributes} />;
			case 'rich':
				return <MultiRootEditorRichDemo data={multiRootEditorContent} rootsAttributes={rootsAttributes} />;
		}
	};

	return (
		<StrictMode>
			<h1>CKEditor 5 – useMultiRootEditor – development sample</h1>

			<div className="buttons" style={ { textAlign: 'center' } }>
				<button
					onClick={ () => setDemo( 'editor' ) }
					disabled={ demo == 'editor' }
				>
					Editor demo
				</button>

				<button
					onClick={ () => setDemo( 'rich' ) }
					disabled={ demo == 'rich' }
				>
					Rich integration demo
				</button>

				<button
					onClick={ () => setDemo( 'context' ) }
					disabled={ demo == 'context' }
				>
					Context demo
				</button>
			</div>
			{ renderDemo() }
		</StrictMode>
	);
}
