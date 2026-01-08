/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';

import { useCKCdnMultiRootEditor } from './useCKCdnMultiRootEditor.js';
import {
	useMultiRootEditor, withCKEditorCloud,
	type MultiRootHookProps,
	type WithCKEditorCloudHocProps
} from '../../src/index.js';

type EditorDemoProps = WithCKEditorCloudHocProps & {
	data: Record<string, string>;
	rootsAttributes: Record<string, Record<string, unknown>>;
};

const withCKCloud = withCKEditorCloud( {
	cloud: {
		version: '43.0.0',
		translations: [ 'de' ],
		premium: true
	}
} );

const MultiRootEditorDemo = withCKCloud( ( { data, cloud }: EditorDemoProps ): ReactNode => {
	const MultiRootEditor = useCKCdnMultiRootEditor( cloud );
	const editorProps: MultiRootHookProps = {
		editor: MultiRootEditor as any,
		data
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
} );

export default MultiRootEditorDemo;
