/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeepWith, isPlainObject, isElement } from 'lodash-es';

export default class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.editor = null;
		this.domContainer = React.createRef();
	}

	componentDidUpdate() {
		if ( !this.editor ) {
			return;
		}

		if ( 'data' in this.props && this.props.data !== this.editor.getData() ) {
			this.editor.setData( this.props.data );
		}

		if ( 'disabled' in this.props ) {
			this.editor.isReadOnly = this.props.disabled;
		}
	}

	// Initialize the editor when the component is mounted.
	componentDidMount() {
		this._initializeEditor();
	}

	// Destroy the editor before unmouting the component.
	componentWillUnmount() {
		this._destroyEditor();
	}

	// Render a <div> element which will be replaced by CKEditor.
	render() {
		// We need to inject initial data to the container where the editable will be enabled. Using `editor.setData()`
		// is a bad practice because it initializes the data after every new connection (in case of collaboration usage).
		// It leads to reset the entire content. See: #68
		return (
			<div ref={ this.domContainer } dangerouslySetInnerHTML={ { __html: this.props.data || '' } }></div>
		);
	}

	_initializeEditor() {
		this.props.editor
			.create( this.domContainer.current , parseConfig( this.props.config ) )
			.then( editor => {
				this.editor = editor;

				if ( 'disabled' in this.props ) {
					editor.isReadOnly = this.props.disabled;
				}

				if ( this.props.onInit ) {
					this.props.onInit( editor );
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on( 'change:data', event => {
					/* istanbul ignore else */
					if ( this.props.onChange ) {
						this.props.onChange( event, editor );
					}
				} );

				viewDocument.on( 'focus', event => {
					/* istanbul ignore else */
					if ( this.props.onFocus ) {
						this.props.onFocus( event, editor );
					}
				} );

				viewDocument.on( 'blur', event => {
					/* istanbul ignore else */
					if ( this.props.onBlur ) {
						this.props.onBlur( event, editor );
					}
				} );
			} )
			.catch( error => {
				console.error( error );
			} );
	}

	_destroyEditor() {
		if ( this.editor ) {
			this.editor.destroy()
				.then( () => {
					this.editor = null;
				} );
		}
	}
}

// Properties definition.
CKEditor.propTypes = {
	editor: PropTypes.func.isRequired,
	data: PropTypes.string,
	config: PropTypes.object,
	onChange: PropTypes.func,
	onInit: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	disabled: PropTypes.bool
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {}
};

function parseConfig( config ) {
	// Replaces all DOM references created using React.createRef() with the "current" DOM node.
	return cloneDeepWith( config, value => {
		if ( isPlainObject( value ) && isElement( value.current ) && Object.keys( value ).length === 1 ) {
			return value.current;
		}
	} );
}
