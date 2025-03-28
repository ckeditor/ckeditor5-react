/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';

import { useMultiRootEditor, type MultiRootHookProps } from '../../src/index.js';
import MultiRootEditor from './MultiRootEditor.js';

type EditorDemoProps = {
	data: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

export default function MultiRootEditorDemo( props: EditorDemoProps ): JSX.Element {
	const editorProps: MultiRootHookProps = {
		editor: MultiRootEditor,
		data: props.data
	};

	const { toolbarElement, editableElements } = useMultiRootEditor( editorProps );

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
