/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { ClassicEditor, Plugin, ContextPlugin, EditorConfig } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';
import type { CKEditorCloudConfig, CKEditorCloudResult } from '../../src/index.js';

type ClassicEditorCreatorConfig = {
	cloud: CKEditorCloudResult<CKEditorCloudConfig>;
	additionalPlugins?: Array<typeof Plugin | typeof ContextPlugin>;
	overrideConfig?: EditorConfig;
};

export const getCKCdnClassicEditor = ( {
	cloud, additionalPlugins, overrideConfig
}: ClassicEditorCreatorConfig ): typeof ClassicEditor => {
	const {
		ClassicEditor: ClassicEditorBase,
		Essentials,
		Autoformat,
		Bold,
		Italic,
		BlockQuote,
		CloudServices,
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

	class CustomEditor extends ClassicEditorBase {
		public static builtinPlugins = [
			Essentials,
			Autoformat,
			Bold,
			Italic,
			BlockQuote,
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
			TextTransformation,
			CloudServices,
			...additionalPlugins || []
		];

		public static defaultConfig = {
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
			language: 'en',
			...overrideConfig
		};
	}

	return CustomEditor;
};
