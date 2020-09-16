/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import { ContextWatchdogContext } from './context.jsx';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';

export default class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.domContainer = React.createRef();

		/**
		 * An instance of EditorWatchdog if the context watchdog was not passed via React's context. `null` otherwise.
		 */
		this.watchdog = null;

		/**
		 * An instance of ContextWatchdog passed from the React's context or `null` otherwise.
		 */
		this.contextWatchdog = null;

		/**
		 * A unique id for an editor component.
		 */
		this._id = uid();
	}

	get editor() {
		if ( this.watchdog ) {
			return this.watchdog.editor;
		}

		if ( this.contextWatchdog ) {
			// TODO - try/catch should not be necessary as `getItem` could return `null` instead of throwing errors.
			try {
				return this.contextWatchdog.getItem( this._id );
			} catch ( err ) {
				return null;
			}
		}

		return null;
	}

	// This component should almost never be updated by React itself.
	shouldComponentUpdate( nextProps ) {
		if ( !this.editor ) {
			return false;
		}

		// Only when the editor component changes the whole structure should be restarted.
		if ( nextProps.id !== this.props.id ) {
			this._destroyEditor();
			this._initializeEditor();

			return true;
		}

		if ( this._shouldUpdateEditor( nextProps ) ) {
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

					// The `onReady` callback should be fired once the `editor` property
					// can be reached from the `<ckeditor>` component.
					// Ideally this part should be moved to the watchdog item creator listeners.
					setTimeout( () => {
						if ( this.props.onReady ) {
							this.props.onReady( { editor: this.editor } );
						}
					} );

					return editor;
				} );
		};

		const onError = ( { error, phase = 'runtime', causesRestart = false } ) => {
			const onErrorCallback = this.props.onError || console.error;

			onErrorCallback( {
				error,
				phase,
				willEditorRestart: causesRestart
			} );
		};

		// TODO: Is it better to use instanceof or duck typing?
		if ( this.context instanceof ContextWatchdog ) {
			// Store the context watchdog - when the context watchdog changes
			// the editor should be destroyed in the previous context watchdog.
			this.contextWatchdog = this.context;

			this.contextWatchdog.add( {
				id: this._id,
				type: 'editor',
				sourceElementOrData: this.domContainer.current,
				config: this._getConfig(),
				creator
			} ).catch( error => onError( { error, phase: 'initialization' } ) );
		} else {
			this.watchdog = new EditorWatchdog( this.props.editor );

			this.watchdog.setCreator( creator );

			this.watchdog.create( this.domContainer.current, this._getConfig() )
				.catch( error => onError( { error, phase: 'initialization' } ) );

			this.watchdog.on( 'error', ( _, evt ) => onError( evt ) );
		}
	}

	_destroyEditor() {
		if ( this.contextWatchdog ) {
			this.contextWatchdog.remove( this._id );
			this.contextWatchdog = null;
		} else {
			this.watchdog.destroy();

			this.watchdog = null;
		}
	}

	_shouldUpdateEditor( nextProps ) {
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

CKEditor.contextType = ContextWatchdogContext;

// Properties definition.
CKEditor.propTypes = {
	editor: PropTypes.func.isRequired,
	data: PropTypes.string,
	config: PropTypes.object,
	onChange: PropTypes.func,
	onReady: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onError: PropTypes.func,
	disabled: PropTypes.bool
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {}
};
