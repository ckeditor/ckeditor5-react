import React, { type ReactNode } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

const SAMPLE_READ_ONLY_LOCK_ID = 'Integration Sample';

type EditorDemoProps = {
	content: string;
};

type EditorDemoState = {
	documents: Array<string>;
	documentID: number;
	editor: ClassicEditor | null;
};

export default class EditorDemo extends React.Component<EditorDemoProps, EditorDemoState> {
	public state: EditorDemoState = {
		documents: [ this.props.content ],
		documentID: 0,
		editor: null
	};

	public render(): ReactNode {
		return (
			<>
				<h2 className="subtitle">Editor Demo</h2>
				<p className="info">Component&apos;s events are logged to the console.</p>

				<div className="buttons">
					<button
						onClick={ () => this.toggleReadOnly() }
						disabled={ !this.state.editor }
					>
						Toggle read-only mode
					</button>

					<button
						onClick={ () => this.simulateError() }
						disabled={ !this.state.editor }
					>
						Simulate an error
					</button>

					<button
						onClick={ () => this.previousDocumentID() }
						disabled={ !this.state.editor || this.state.documentID == 0 }
					>
						Previous document ID
					</button>

					<button
						onClick={ () => this.nextDocumentID() }
					>
						Next document ID
					</button>
				</div>

				<CKEditor
					editor={ ClassicEditor }
					id={ this.state.documentID }
					data={ this.state.documents[ this.state.documentID ] }
					watchdogConfig={ { crashNumberLimit: 10 } }

					onReady={ editor => {
						window.editor = editor;

						console.log( 'event: onReady' );
						console.log( 'Editor is ready to use! You can use "editor" variable to play with it.' );

						this.setState( { editor } );
					} }

					onChange={ ( event, editor ) => {
						this.updateData();

						console.log( 'event: onChange', { event, editor } );
					} }

					onBlur={ ( event, editor ) => {
						console.log( 'event: onBlur', { event, editor } );
					} }

					onFocus={ ( event, editor ) => {
						console.log( 'event: onFocus', { event, editor } );
					} }
				/>
			</>
		);
	}

	private updateData() {
		this.setState( {
			documents: this.state.documents.map( ( data, index ) => {
				if ( index === this.state.documentID ) {
					return this.state.editor!.getData();
				}

				return data;
			} )
		} );
	}

	private toggleReadOnly() {
		const editor = this.state.editor!;

		if ( editor.isReadOnly ) {
			editor.disableReadOnlyMode( SAMPLE_READ_ONLY_LOCK_ID );
		} else {
			editor.enableReadOnlyMode( SAMPLE_READ_ONLY_LOCK_ID );
		}
	}

	private simulateError() {
		setTimeout( () => {
			const err: any = new Error( 'foo' );

			err.context = this.state.editor;
			err.is = () => true;

			throw err;
		} );
	}

	private nextDocumentID() {
		this.setState( {
			documentID: this.state.documentID + 1,
			documents: this.state.documents.length < this.state.documentID + 1 ?
				this.state.documents :
				[ ...this.state.documents, this.props.content ]
		} );
	}

	private previousDocumentID(): void {
		this.setState( { documentID: Math.max( this.state.documentID - 1, 0 ) } );
	}
}
