import React from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

import { useMultiRootEditor, type MultiRootHookProps } from '@ckeditor/ckeditor5-react';

type EditorDemoProps = {
	data: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function MultiRootEditorDemo( props: EditorDemoProps ): JSX.Element {
	const editorProps: MultiRootHookProps = {
		editor: MultiRootEditor,
		data: props.data
	};

	const {
		editor, toolbarElement, editableElements,
		data, setData,
		attributes, setAttributes
	} = useMultiRootEditor( editorProps );

	return (
		<>
			<h2 className="subtitle">Multi-root Editor Demo</h2>
			<p className="info">
				This sample demonstrates the minimal React application that uses multi-root editor integration.<br />
				You may use it as a starting point for your application.
			</p>
			<hr /><br />

			<div>
				{ toolbarElement }

				{ editableElements }
			</div>
		</>
	);
}
