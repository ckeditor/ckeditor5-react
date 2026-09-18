/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode } from 'react';

import { ClassicEditor, Bold, Essentials, Heading, Italic, Paragraph } from 'ckeditor5';

import { getCKEditorStyleSheet } from '../_internal/getCKEditorStyleSheet.js';
import { ShadowRootHost } from '../_internal/ShadowRootHost.js';
import { CKEditor } from '../../src/index.js';

type CKEditorShadowRootDemoProps = {
	content: string;
	mode: ShadowRootMode;
};

export const CKEditorShadowRootDemo = ( { content, mode }: CKEditorShadowRootDemoProps ): ReactNode => (
	<ShadowRootHost
		key={ mode }
		mode={ mode }
		adoptedStyleSheets={ () => [ getCKEditorStyleSheet() ] }
	>
		<CKEditor
			editor={ ClassicEditor }
			data={ content }
			disableWatchdog
			config={ {
				licenseKey: 'GPL',
				plugins: [ Essentials, Paragraph, Heading, Bold, Italic ],
				toolbar: [ 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic' ]
			} }
		/>
	</ShadowRootHost>
);
