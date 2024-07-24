/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { type ReactNode } from 'react';
import { useCKCdnClassicEditor } from './useCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

type CKEditorCloudDemoProps = {
	content: string;
};

export const CKEditorCloudDemo = ( { content }: CKEditorCloudDemoProps ): ReactNode => {
	const cloud = useCKEditorCloud( {
		version: '42.0.1',
		withPremiumFeatures: true
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = useCKCdnClassicEditor( {
		cloud: cloud.data
	} );

	return (
		<CKEditor
			editor={ CKEditorClassic }
			data={ content }
		/>
	);
};
