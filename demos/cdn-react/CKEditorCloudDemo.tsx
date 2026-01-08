/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';
import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCloudDemoProps = {
	content: string;
};

export const CKEditorCloudDemo = ( { content }: CKEditorCloudDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '43.0.0',
		premium: true
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = getCKCdnClassicEditor( {
		cloud
	} );

	return (
		<CKEditor
			editor={ CKEditorClassic }
			data={ content }
		/>
	);
};
