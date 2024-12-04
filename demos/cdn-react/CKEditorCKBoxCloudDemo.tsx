/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';
import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCKBoxCloudDemoProps = {
	content: string;
};

export const CKEditorCKBoxCloudDemo = ( { content }: CKEditorCKBoxCloudDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '43.0.0',
		premium: true,
		ckbox: {
			version: '2.5.1'
		}
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const { CKBox, CKBoxImageEdit } = cloud.CKEditor;
	const CKEditorClassic = getCKCdnClassicEditor( {
		cloud,
		additionalPlugins: [
			CKBox,
			CKBoxImageEdit
		],
		overrideConfig: {
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent',
					'|', 'ckbox', 'ckboxImageEdit'
				]
			},
			image: {
				toolbar: [
					'imageStyle:inline',
					'imageStyle:block',
					'imageStyle:side',
					'|',
					'toggleImageCaption',
					'imageTextAlternative',
					'|',
					'ckboxImageEdit'
				]
			},
			ckbox: {
				tokenUrl: 'https://api.ckbox.io/token/demo',
				forceDemoLabel: true,
				allowExternalImagesEditing: [ /^data:/, /^i.imgur.com\//, 'origin' ]
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
