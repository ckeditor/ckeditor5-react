/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { type ReactNode } from 'react';

import type { Plugin } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCloudPluginsDemoProps = {
	content: string;
};

declare global {
	interface Window {
		'@wiris/mathtype-ckeditor5': typeof Plugin;
	}
}

export const CKEditorCloudPluginsDemo = ( { content }: CKEditorCloudPluginsDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '43.0.0',
		translations: [ 'pl', 'de' ],
		premium: true,
		plugins: {
			Wiris: {
				scripts: [
					'https://www.wiris.net/demo/plugins/app/WIRISplugins.js',
					'https://cdn.jsdelivr.net/npm/@wiris/mathtype-ckeditor5@8.11.0/dist/browser/index.umd.js'
				],
				stylesheets: [
					'https://cdn.jsdelivr.net/npm/@wiris/mathtype-ckeditor5@8.11.0/dist/browser/index.css'
				],
				checkPluginLoaded: () => window[ '@wiris/mathtype-ckeditor5' ]
			}
		}
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = getCKCdnClassicEditor( {
		cloud,
		additionalPlugins: [
			cloud.loadedPlugins!.Wiris
		],
		overrideConfig: {
			toolbar: {
				items: [
					'undo', 'redo',
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
