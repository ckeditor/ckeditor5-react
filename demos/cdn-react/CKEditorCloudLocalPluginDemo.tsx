/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';
import type { Plugin } from 'ckeditor5';

import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCloudLocalPluginsDemoProps = {
	content: string;
};

declare global {
	interface Window {
		MyLocalPlugin: typeof Plugin;
	}
}

export const CKEditorCloudLocalPluginsDemo = ( { content }: CKEditorCloudLocalPluginsDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '43.0.0',
		plugins: {
			MyLocalPlugin: [
				'/demos/cdn-react/local-plugin.umd.js'
			]
		}
	} );

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = getCKCdnClassicEditor( {
		cloud,
		additionalPlugins: [
			cloud.loadedPlugins.MyLocalPlugin
		],
		overrideConfig: {
			toolbar: {
				items: [
					'highlight',
					'|', 'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent',
					'|', 'MathType', 'ChemType'
				]
			}
		}
	} );

	return (
		<CKEditor
			editor={ CKEditorClassic }
			data={ content }
		/>
	);
};
