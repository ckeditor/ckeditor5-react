/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { type ReactNode } from 'react';
import { useCKCdnClassicEditor } from './useCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCKBoxCloudDemoProps = {
	content: string;
};

export const CKEditorCKBoxCloudDemo = ( { content }: CKEditorCKBoxCloudDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '42.0.1',
		withPremiumFeatures: true,
		withCKBox: {
			version: '2.5.1'
		}
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const {
		CKBox,
		CKBoxImageEdit,
		CKFinder,
		CKFinderUploadAdapter
	} = cloud.data.CKEditor;

	const CKEditorClassic = useCKCdnClassicEditor( {
		cloud: cloud.data,
		additionalPlugins: [
			CKBox,
			CKFinder,
			CKFinderUploadAdapter,
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
