import React, { useState } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';

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

			{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
			<CKEditorContext context={ ClassicEditor.Context }>
				<div className="buttons">
					<button
						onClick={ () => simulateError( state.editor1! ) }
						disabled={ !state.editor1 }
					>
						Simulate an error in the first editor
					</button>
				</div>

				{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
				<CKEditor
					editor={ ClassicEditor }
					data={ props.content }
					onReady={ editor => {
						window.editor2 = editor;

						console.log( 'event: onReady' );
						console.log( 'Editor is ready to use! You can use "editor1" variable to play with it.' );

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

				{ /* @ts-expect-error: Caused by linking to parent project and conflicting react types */ }
				<CKEditor
					editor={ ClassicEditor }
					data="<h2>Another Editor</h2><p>... in common Context</p>"
					onReady={ editor => {
						window.editor1 = editor;

						console.log( 'event: onReady' );
						console.log( 'Editor is ready to use! You can use "editor2" variable to play with it.' );

						setState( prevState => ( { ...prevState, editor2: editor } ) );
					} }
				/>
			</CKEditorContext>
		</>
	);
}
