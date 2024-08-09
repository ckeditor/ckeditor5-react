/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { useState } from 'react';
import ClassicEditor from './ClassicEditor';
import { CKEditor, CKEditorContext } from '../../src/index.js';

declare global {
	interface Window {
		editor1: ClassicEditor | null;
		editor2: ClassicEditor | null;
	}
}

type ContextDemoProps = {
	content: string;
};

type ContextDemoState = {
	editor1: ClassicEditor | null;
	editor2: ClassicEditor | null;
};

export default function ContextDemo( props: ContextDemoProps ): JSX.Element {
	const [ state, setState ] = useState<ContextDemoState>( {
		editor1: null,
		editor2: null
	} );

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
				onTrackInitializedEditors={ editors => {
					console.log( 'Editors:', editors );
				}}
			>
				<div className="buttons">
					<button
						onClick={ () => simulateError( state.editor1! ) }
						disabled={ !state.editor1 }
					>
						Simulate an error in the first editor
					</button>
				</div>

				<CKEditor
					id='abc'
					editor={ ClassicEditor as any }
					data={ props.content }
					onReady={ ( editor: any ) => {
						window.editor2 = editor;

						setState( prevState => ( { ...prevState, editor1: editor } ) );
					} }
				/>

				<div className="buttons">
					<button
						onClick={ () => simulateError( state.editor2! ) }
						disabled={ !state.editor2 }
					>
						Simulate an error in the second editor
					</button>
				</div>

				<CKEditor
					editor={ ClassicEditor as any }
					data="<h2>Another Editor</h2><p>... in common Context</p>"
					onReady={ ( editor: any ) => {
						window.editor1 = editor;

						setState( prevState => ( { ...prevState, editor2: editor } ) );
					} }
				/>
			</CKEditorContext>
		</>
	);
}
