import React, { type ReactNode } from 'react';
import EditorDemo from './EditorDemo';
import ContextDemo from './ContextDemo';

type AppState = {
	demo: 'editor' | 'context';
};

const editorContent = `
	<h2>Sample</h2>
	<p>This is an instance of the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor">
	classic editor build</a>.</p>
	<!--<figure class="image">
		<img src="./sample.jpg" alt="CKEditor 5 Sample image." />
	</figure>-->
	<p>You can use this sample to validate whether your 
	<a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html">custom build</a> works fine.</p>
`;

// eslint-disable-next-line @typescript-eslint/ban-types
export default class App extends React.Component<{}, AppState> {
	public state: AppState = {
		demo: 'editor'
	};

	public render(): ReactNode {
		return (
			<>
				<h1>CKEditor 5 – React Component – development sample</h1>

				<div className="buttons" style={{ textAlign: 'center' }}>
					<button
						onClick={ () => this.showDemo( 'editor' ) }
						disabled={ this.state.demo == 'editor' }
					>
						Editor demo
					</button>

					<button
						onClick={ () => this.showDemo( 'context' ) }
						disabled={ this.state.demo == 'context' }
					>
						Context demo
					</button>
				</div>
				{
					this.state.demo == 'editor' ?
						<EditorDemo content={ editorContent }/> :
						<ContextDemo content={ editorContent }/>
				}
			</>
		);
	}

	private showDemo( demo: AppState[ 'demo' ] ) {
		this.setState( {
			demo
		} );
	}
}
