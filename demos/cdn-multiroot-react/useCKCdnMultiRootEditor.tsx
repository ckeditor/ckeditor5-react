/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { MultiRootEditor } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import type { CKEditorCloudConfig, CKEditorCloudResult } from '../../src/index.js';

export const useCKCdnMultiRootEditor = ( cloud: CKEditorCloudResult<CKEditorCloudConfig> ): typeof MultiRootEditor => {
	const {
		MultiRootEditor: MultiRootEditorBase,
		CloudServices,
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		Indent,
		Link,
		List,
		MediaEmbed,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		Table,
		TableToolbar,
		TextTransformation
	} = cloud.CKEditor;

	return class MultiRootEditor extends MultiRootEditorBase {
		public static override builtinPlugins = [
			Essentials,
			CKFinderUploadAdapter,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
			CKBox,
			CKFinder,
			CloudServices,
			EasyImage,
			Heading,
			Image,
			ImageCaption,
			ImageStyle,
			ImageToolbar,
			ImageUpload,
			Indent,
			Link,
			List,
			MediaEmbed,
			Paragraph,
			PasteFromOffice,
			PictureEditing,
			Table,
			TableToolbar,
			TextTransformation
		];

		public static override defaultConfig = {
			toolbar: {
				items: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				]
			},
			image: {
				toolbar: [
					'imageStyle:inline',
					'imageStyle:block',
					'imageStyle:side',
					'|',
					'toggleImageCaption',
					'imageTextAlternative'
				]
			},
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			language: 'en'
		};
	};
};
