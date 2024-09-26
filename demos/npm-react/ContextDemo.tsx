/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState } from 'react';

import type { Editor } from 'ckeditor5';

import ClassicEditor from './ClassicEditor.js';
import { CKEditor, CKEditorContext } from '../../src/index.js';

declare global {
	interface Window {
		editor1: Editor | null;
		editor2: Editor | null;
	}
}

type ContextDemoProps = {
	content: string;
};

export default function ContextDemo( props: ContextDemoProps ): JSX.Element {
	const [ state, setState ] = useState<Record<string, { instance: ClassicEditor }>>( {} );

	const simulateError = ( editor: ClassicEditor ) => {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = editor;
			err.is = () => true;

			throw err;
		} );
	};

	return (
		<>
			<h2 className="subtitle">Editor Context Demo</h2>
			<p className="info">Component&apos;s events are logged to the console.</p>

			<CKEditorContext
				context={ ClassicEditor.Context as any }
				contextWatchdog={ ClassicEditor.ContextWatchdog as any }
				onChangeInitializedEditors={ editors => {
					setState( editors as any );
				} }
			>
				<div className="buttons">
					<button
						onClick={ () => simulateError( state.editor1!.instance ) }
						disabled={ !state.editor1 }
					>
						Simulate an error in the first editor
					</button>
				</div>

				<CKEditor
					contextItemMetadata={{
						name: 'editor1'
					}}
					editor={ ClassicEditor as any }
					data={ props.content }
				/>

				<div className="buttons">
					<button
						onClick={ () => simulateError( state.editor2!.instance ) }
						disabled={ !state.editor2 }
					>
						Simulate an error in the second editor
					</button>
				</div>

				<CKEditor
					contextItemMetadata={{
						name: 'editor2'
					}}
					editor={ ClassicEditor as any }
					data="<h2>Another Editor</h2><p>... in common Context</p>"
				/>
			</CKEditorContext>
		</>
	);
}
