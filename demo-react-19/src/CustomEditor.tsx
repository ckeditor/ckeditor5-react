/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	ClassicEditor as ClassicEditorBase,
	Essentials,
	Autoformat,
	BlockQuote,
	EasyImage,
	Heading,
	List,
	Link,
	MediaEmbed,
	Paragraph,
	Table,
	TableToolbar,
	Typing,
	Indent,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	PictureEditing,
	CloudServices,
	Bold,
	Italic
} from 'ckeditor5';

import 'ckeditor5/index.css';

export default class CustomEditor extends ClassicEditorBase {
	public static override builtinPlugins = [
		Essentials,
		Bold,
		Italic,
		Autoformat,
		BlockQuote,
		EasyImage,
		Heading,
		List,
		Link,
		MediaEmbed,
		Paragraph,
		Table,
		TableToolbar,
		Typing,
		Indent,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
		PictureEditing,
		CloudServices
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
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'en'
	};
}
