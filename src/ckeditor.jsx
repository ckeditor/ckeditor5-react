/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import uid from '@ckeditor/ckeditor5-utils/src/uid';
import { ContextWatchdogContext } from './ckeditorcontext.jsx';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';

export default class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.domContainer = React.createRef();

		/**
		 * An instance of EditorWatchdog or an instance of EditorWatchdog-like adapter for ContextWatchdog.
		 */
		this.watchdog = null;
	}

	get editor() {
		if ( !this.watchdog ) {
			return null;
		}

		return this.watchdog.editor;
	}

	// The CKEditor component should not be updated by React itself.
	// However, if the component identifier changes, the whole structure should be created once again.
	shouldComponentUpdate( nextProps ) {
		if ( !this.editor ) {
			return false;
		}

		// Only when the editor component changes the whole structure should be restarted.
		if ( nextProps.id !== this.props.id ) {
			this._destroyEditor();

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

	// Initialize the editor when the component is updated as it should be destroyed before the update.
	componentDidUpdate() {
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
							this.props.onReady( this.editor );
						}
					} );

					return editor;
				} );
		};

		const onError = ( error, details ) => {
			const onErrorCallback = this.props.onError || console.error;

			onErrorCallback( error, details );
		};

		// TODO: Is it better to use instanceof or duck typing?
		if ( this.context instanceof ContextWatchdog ) {
			// Store the watchdog - when the editor should be restarted then it should be destroyed in the previous watchdog.
			this.watchdog = new ContextWatchdogToEditorWatchdogAdapter( this.context );
		} else {
			this.watchdog = new EditorWatchdog( this.editor );
		}

		this.watchdog.setCreator( creator );

		this.watchdog.on( 'error', ( _, { error, causesRestart } ) => {
			onError( error, { phase: 'runtime', willEditorRestart: causesRestart } );
		} );

		this.watchdog.create( this.domContainer.current, this._getConfig() )
			.catch( error => onError( error, { phase: 'initialization', willEditorRestart: false } ) );
	}

	_destroyEditor() {
		this.watchdog.destroy();
		this.watchdog = null;
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

/**
 * An adapter aligning Context Watchdog API to the Editor Watchdog API for easier usage.
 */
class ContextWatchdogToEditorWatchdogAdapter {
	constructor( contextWatchdog ) {
		this._contextWatchdog = contextWatchdog;

		/**
		 * A unique id for the ContextWatchdog creator.
		 */
		this._id = uid();
	}

	setCreator( creator ) {
		this._creator = creator;
	}

	async create( sourceElementOrData, config ) {
		await this._contextWatchdog.add( {
			sourceElementOrData,
			config,
			creator: this._creator,
			id: this._id,
			type: 'editor'
		} );
	}

	on( _, callback ) {
		// Assume that the event name is itemError.
		this._contextWatchdog.on( 'itemError', ( _, { itemId, causesRestart, error } ) => {
			if ( itemId === this._id ) {
				callback( null, { error, causesRestart } );
			}
		} );
	}

	destroy() {
		this._contextWatchdog.remove( this._id );
	}

	get editor() {
		// TODO - try/catch should not be necessary as `getItem` could return `null` instead of throwing errors.
		try {
			return this._contextWatchdog.getItem( this._id );
		} catch ( err ) {
			return null;
		}
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
	disabled: PropTypes.bool,
	onInit: ( props, propName ) => {
		if ( props[ propName ] ) {
			return new Error(
				'The "onInit" property is not supported anymore by the CKEditor component. Use the "onReady" property instead.'
			);
		}
	}
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {}
};
