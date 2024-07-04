/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';

import { useMultiRootEditor, type MultiRootHookProps } from '../../index';
import MultiRootEditor from './MultiRootEditor';

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
