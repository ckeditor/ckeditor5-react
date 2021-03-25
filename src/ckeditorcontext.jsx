/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';

export const ContextWatchdogContext = React.createContext( 'contextWatchdog' );

export default class CKEditorContext extends React.Component {
	constructor( props, context ) {
		super( props, context );

		/**
		 * @type {module:watchdog/contextwatchdog~ContextWatchdog|null}
		 */
		this.contextWatchdog = null;

		if ( this.props.isLayoutReady ) {
			this._initializeContextWatchdog();
		}
	}

	/**
	 * Checks whether the component should be updated by React itself.
	 *
	 * @param {Object} nextProps
	 * @return {Boolean}
	 */
	shouldComponentUpdate( nextProps ) {
		// If the config has changed then the `ContextWatchdog` needs to be destroyed and recreated using the new config.
		if ( nextProps.id !== this.props.id ) {
			return true;
		}

		// Rerender the component once again if the layout is ready.
		if ( nextProps.isLayoutReady && !this.contextWatchdog ) {
			return true;
		}

		// Rerender the component only when children has changed.
		return this.props.children !== nextProps.children;
	}

	/**
	 * Re-render the entire component once again. The old editor will be destroyed and the new one will be created.
	 */
	componentDidUpdate() {
		// If the `isLayoutReady` property has changed from `false` to `true`, the instance of `ContextWatchdog` does not exist.
		if ( this.contextWatchdog ) {
			this.contextWatchdog.destroy();
		}

		this._initializeContextWatchdog();
	}

	/**
	 * Destroy the context before unmounting the component.
	 */
	componentWillUnmount() {
		this._destroyContext();
	}

	/**
	 * @return {JSX.Element}
	 */
	render() {
		return (
			<ContextWatchdogContext.Provider value={ this.contextWatchdog } >
				{ this.props.children }
			</ContextWatchdogContext.Provider>
		);
	}

	/**
	 * @private
	 */
	_initializeContextWatchdog() {
		this.contextWatchdog = new ContextWatchdog( this.props.context );

		this.contextWatchdog.create( this.props.config )
			.catch( error => {
				this.props.onError( error, {
					phase: 'initialization',
					willContextRestart: false
				} );
			} );

		this.contextWatchdog.on( 'error', ( _, errorEvent ) => {
			this.props.onError( errorEvent.error, {
				phase: 'runtime',
				willContextRestart: errorEvent.causesRestart
			} );
		} );

		this.contextWatchdog.on( 'stateChange', () => {
			if ( this.contextWatchdog.state === 'ready' && this.props.onReady ) {
				this.props.onReady( this.contextWatchdog.context );
			}
		} );
	}

	/**
	 * @private
	 */
	_destroyContext() {
		if ( this.contextWatchdog ) {
			this.contextWatchdog.destroy();
			this.contextWatchdog = null;
		}
	}
}

CKEditorContext.defaultProps = {
	isLayoutReady: true,
	onError: console.error
};

// Properties definition.
CKEditorContext.propTypes = {
	context: PropTypes.func.isRequired,
	id: PropTypes.string,
	isLayoutReady: PropTypes.bool,
	config: PropTypes.object,
	onReady: PropTypes.func,
	onError: PropTypes.func
};
