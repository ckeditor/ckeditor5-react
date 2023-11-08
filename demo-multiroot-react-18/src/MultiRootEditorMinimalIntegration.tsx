import React from 'react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

import { useMultiRootEditor, type MultiRootHookProps } from '../../src';

type EditorDemoProps = {
	content: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function EditorDemo( props: EditorDemoProps ): JSX.Element {
	const editorProps: MultiRootHookProps = {
		editor: MultiRootEditor,
		content: props.content
	};

	const {
		editor, toolbarElement, editableElements,
		content, setContent,
		attributes, setAttributes
	} = useMultiRootEditor( editorProps );

	return (
		<>
			{ toolbarElement }
			{ editableElements.map( ( element, idx ) => {
				return (
					<div className="my-editable-parent" key={idx}>
						{ element }
					</div>
				);
			} ) }
		</>
	);
}
