import React, { type ReactNode } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';

type ContextDemoProps = {
	content: string;
};

type ContextDemoState = {
	editor1: ClassicEditor | null;
	editor2: ClassicEditor | null;
};

export default class ContextDemo extends React.Component<ContextDemoProps, ContextDemoState> {
	public state: ContextDemoState = {
		editor1: null,
		editor2: null
	};

	public render(): ReactNode {
		return (
			<>
				<h2 className="subtitle">Editor Context Demo</h2>
				<p className="info">Component&apos;s events are logged to the console.</p>

				<CKEditorContext context={ ClassicEditor.Context }>
					<div className="buttons">
						<button
							onClick={ () => this.simulateError( this.state.editor1! ) }
							disabled={ !this.state.editor1 }
						>
							Simulate an error in the first editor
						</button>
					</div>

					<CKEditor
						editor={ ClassicEditor }
						data={ this.props.content }

						onReady={ editor => {
							window.editor2 = editor;

							console.log( 'event: onReady' );
							console.log( 'Editor is ready to use! You can use "editor1" variable to play with it.' );

							this.setState( { editor1: editor } );
						} }
					/>

					<div className="buttons">
						<button
							onClick={ () => this.simulateError( this.state.editor2! ) }
							disabled={ !this.state.editor2 }
						>
							Simulate an error in the second editor
						</button>
					</div>

					<CKEditor
						editor={ ClassicEditor }
						data="<h2>Another Editor</h2><p>... in common Context</p>"

						onReady={ editor => {
							window.editor1 = editor;

							console.log( 'event: onReady' );
							console.log( 'Editor is ready to use! You can use "editor2" variable to play with it.' );

							this.setState( { editor2: editor } );
						} }
					/>
				</CKEditorContext>
			</>
		);
	}

	private simulateError( editor: ClassicEditor ) {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = editor;
			err.is = () => true;

			throw err;
		} );
	}
}
