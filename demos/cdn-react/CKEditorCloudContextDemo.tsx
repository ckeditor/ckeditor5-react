/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React from 'react';
import { CKEditor, CKEditorContext, useCKEditorCloud } from '../../src/index.js';

export const CKEditorCloudContextDemo = (): JSX.Element => {
	const cloud = useCKEditorCloud( {
		version: '43.0.0',
		premium: true
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const { ClassicEditor } = cloud.CKEditor;

	return (
		<CKEditorContext
			context={ ClassicEditor.Context }
			contextWatchdog={ ClassicEditor.ContextWatchdog }
			onChangeInitializedEditors={ editors => {
				console.log( 'Initialized editors:', editors );
			} }
		>
			<CKEditorNestedInstanceDemo
				name='editor1'
				content='<p>Editor 1</p>'
			/>

			<br />

			<CKEditorNestedInstanceDemo
				name='editor2'
				content='<p>Editor 2</p>'
			/>
		</CKEditorContext>
	);
};

function CKEditorNestedInstanceDemo( { name, content }: { name: string; content?: string } ): JSX.Element {
	const cloud = useCKEditorCloud( {
		version: '43.0.0'
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const { CKEditor: CK } = cloud;

	return (
		<CKEditor
			contextItemMetadata={{
				name
			}}
			editor={ CK.ClassicEditor }
			data={ content }
			config={{
				plugins: [
					CK.Essentials,
					CK.CKFinderUploadAdapter,
					CK.Autoformat,
					CK.Bold,
					CK.Italic,
					CK.BlockQuote,
					CK.CloudServices,
					CK.EasyImage,
					CK.Heading,
					CK.Image,
					CK.ImageCaption,
					CK.ImageStyle,
					CK.ImageToolbar,
					CK.ImageUpload,
					CK.Indent,
					CK.IndentBlock,
					CK.Link,
					CK.List,
					CK.MediaEmbed,
					CK.Paragraph,
					CK.PasteFromOffice,
					CK.PictureEditing,
					CK.Table,
					CK.TableToolbar,
					CK.TextTransformation,
					CK.Base64UploadAdapter
				],
				toolbar: [
					'undo', 'redo',
					'|', 'heading',
					'|', 'bold', 'italic',
					'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
					'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
				],
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
				}
			}}
		/>
	);
}
