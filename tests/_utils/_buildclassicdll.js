/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals  window */

// Dll core.
import 'ckeditor5/build/ckeditor5-dll.js';

// Editor creator.
import '@ckeditor/ckeditor5-editor-classic/build/editor-classic';

// Plugins.
import '@ckeditor/ckeditor5-image/build/image';
import '@ckeditor/ckeditor5-link/build/link';
import '@ckeditor/ckeditor5-basic-styles/build/basic-styles';
import '@ckeditor/ckeditor5-indent/build/indent';
import '@ckeditor/ckeditor5-list/build/list';
import '@ckeditor/ckeditor5-table/build/table';
import '@ckeditor/ckeditor5-autoformat/build/autoformat';
import '@ckeditor/ckeditor5-block-quote/build/block-quote';
import '@ckeditor/ckeditor5-cloud-services/build/cloud-services';
import '@ckeditor/ckeditor5-essentials/build/essentials';
import '@ckeditor/ckeditor5-heading/build/heading';
import '@ckeditor/ckeditor5-media-embed/build/media-embed';
import '@ckeditor/ckeditor5-paste-from-office/build/paste-from-office';

const { ClassicEditor: ClassicEditorBase } = window.CKEditor5.editorClassic;

const { Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload } = window.CKEditor5.image;
const { Link } = window.CKEditor5.link;
const { Bold, Italic } = window.CKEditor5.basicStyles;
const { Indent } = window.CKEditor5.indent;
const { List } = window.CKEditor5.list;
const { Table, TableToolbar } = window.CKEditor5.table;
const { Autoformat } = window.CKEditor5.autoformat;
const { BlockQuote } = window.CKEditor5.blockQuote;
const { CloudServices } = window.CKEditor5.cloudServices;
const { Essentials } = window.CKEditor5.essentials;
const { Heading } = window.CKEditor5.heading;
const { MediaEmbed } = window.CKEditor5.mediaEmbed;
const { PasteFromOffice } = window.CKEditor5.pasteFromOffice;
const { Paragraph } = window.CKEditor5.paragraph;
const { TextTransformation } = window.CKEditor5.typing;

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
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
	Table,
	TableToolbar,
	TextTransformation
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
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

window.ClassicEditor = ClassicEditor;
