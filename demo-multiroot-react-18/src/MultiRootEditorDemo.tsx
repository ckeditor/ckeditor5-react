import React from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

import { useMultiRootEditor, type MultiRootHookProps } from '../../src';

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
			{ toolbarElement }

			{ editableElements }
		</>
	);
}
