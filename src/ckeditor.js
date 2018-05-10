import React from 'react';

// TODO: set initial data using constructor.
// TODO: prop types.
// TODO: throw when configuration changes during execution.
export default class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		this.domContainer = null;
		this.editorInstance = null;
		this.constructor = this.props.editor;
	}

	// This component should never be updated by React itself.
	shouldComponentUpdate() {
		return false;
	}

	// Update editor data if data property is changed.
	componentWillReceiveProps( newProps ) {
		if ( this.editorInstance && newProps.data ) {
			this.editorInstance.setData( newProps.data );
		}
	}

	// Initialize editor when component is mounted.
	componentDidMount() {
		this._initializeEditor();
	}

	// Destroy editor before unmouting component.
	componentWillUnmount() {
		this._destroyEditor();
	}

	// Render <div> element which will be replaced by CKEditor.
	render() {
		return <div ref={ ref => ( this.domContainer = ref ) }></div>;
	}

	_initializeEditor() {
		this.constructor
			.create( this.domContainer, this.props.config )
			.then( editor => {
				this.editorInstance = editor;
				this.editorInstance.setData( this.props.data );

				const document = this.editorInstance.model.document;
				document.on( 'change', () => {
					if ( document.differ.getChanges().length > 0 ) {
						this.props.onChange( editor.getData() );
					}
				} );
			} )
			.catch( error => {
				console.error( error );
			} );
	}

	_destroyEditor() {
		if ( this.editorInstance ) {
			this.editorInstance.destroy();
		}
	}
}
