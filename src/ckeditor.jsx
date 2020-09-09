/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

export default class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.domContainer = React.createRef();
		this.watchdog = null;

		this._id = uid();
	}

	get editor() {
		if ( this.watchdog ) {
			return this.watchdog.editor;
		}

		if ( this.props.contextWatchdog ) {
			try {
				return this.props.contextWatchdog.getItem( this._id );
			} catch ( err ) {
				return null;
			}
		}

		return null;
	}

	// This component should never be updated by React itself.
	shouldComponentUpdate( nextProps ) {
		if ( !this.editor ) {
			return false;
		}

		if ( this._shouldUpdateContent( nextProps ) ) {
			this.editor.setData( nextProps.data );
		}

		if ( 'disabled' in nextProps ) {
			this.editor.isReadOnly = nextProps.disabled;
		}

		return false;
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
		return (
			<div ref={ this.domContainer }></div>
		);
	}

	_initializeEditor() {
		const creator = ( el, config ) => {
			return this.props.editor.create( el, config )
				.then( editor => {
					if ( 'disabled' in this.props ) {
						editor.isReadOnly = this.props.disabled;
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

					// The onInit should be fired once the `editor` property
					// can be reached from the <ckeditor> component.
					// Ideally this part should be moved to the watchdog item creator listeners.
					setTimeout( () => {
						if ( this.props.onInit ) {
							this.props.onInit( this.editor );
						}
					} );

					return editor;
				} );
		};

		const onError = error => {
			const onErrorCallback = this.props.onError || console.error;

			onErrorCallback( error );
		};

		if ( this.props.contextWatchdog ) {
			this.props.contextWatchdog.add( {
				id: this._id,
				type: 'editor',
				sourceElementOrData: this.domContainer.current,
				config: this._getConfig(),
				creator
			} ).catch( onError );
		} else {
			this.watchdog = new EditorWatchdog( this.props.editor );

			this.watchdog.setCreator( creator );

			this.watchdog.create( this.domContainer.current, this._getConfig() )
				.catch( onError );

			this.watchdog.on( 'error', onError );
		}
	}

	_destroyEditor() {
		if ( this.props.contextWatchdog ) {
			this.props.contextWatchdog.remove( this._id );
		} else {
			this.watchdog.destroy();

			this.watchdog = null;
		}
	}

	_shouldUpdateContent( nextProps ) {
		// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
		// property as a static string and updated a state of component when the editor's content has been changed.
		// If we avoid checking those properties, the editor's content will back to the initial value because
		// the state has been changed and React will call this method.
		if ( this.props.data === nextProps.data ) {
			return false;
		}

		// We should not change data if the editor's content is equal to the `#data` property.
		if ( this.editor.getData() === nextProps.data ) {
			return false;
		}

		return true;
	}

	_getConfig() {
		if ( this.props.data && this.props.config.initialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `data` properties. ' +
				'The config property is over the data value and the first one will be used when specified both.'
			);
		}

		// Merge two possible ways of providing data into the `config.initialData` field.
		return {
			...this.props.config,
			initialData: this.props.config.initialData || this.props.data || ''
		};
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
	onError: PropTypes.func,
	disabled: PropTypes.bool,
	contextWatchdog: PropTypes.object
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {}
};
