/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import CKEditorComponent from './ckeditor.jsx';

export default class Context extends React.Component {
	constructor( props, context ) {
		super( props, context );

		this._initializeContext();
	}

	shouldComponentUpdate( nextProps ) {
		// If the configuration changes then the ContextWatchdog needs to be destroyed and recreated
		// On top of the new configuration.
		if ( nextProps.config !== this.props.config ) {
			this.contextWatchdog.destroy();

			this._initializeContext();
		}

		// Rerender the component only when children has changed.
		return this.props.children !== nextProps.children;
	}

	render() {
		return (
			<React.Fragment>
				{React.Children.map( this.props.children, child => {
					if ( child.type === CKEditorComponent ) {
						return React.cloneElement( child, {
							contextWatchdog: this.contextWatchdog
						} );
					}

					return child;
				} ) }
			</React.Fragment>
		);
	}

	componentWillUnmount() {
		this._destroyContext();
	}

	_initializeContext() {
		this.contextWatchdog = new ContextWatchdog( this.props.context );

		const handleErrorEvent = errorEvent => {
			if ( this.props.onError ) {
				this.props.onError( errorEvent );
			} else {
				console.error( errorEvent );
			}
		};

		this.contextWatchdog.create( this.props.config )
			.catch( error => {
				handleErrorEvent( { error, phase: 'initialization' } );
			} );

		this.contextWatchdog.on( 'error', ( _, errorEvent ) => {
			handleErrorEvent( {
				phase: 'runtime',
				error: errorEvent.error,
				willContextRestart: errorEvent.causesRestart
			} );
		} );

		this.contextWatchdog.on( 'stateChange', () => {
			if ( this.contextWatchdog.state === 'ready' && this.props.onReady ) {
				this.props.onReady();
			}
		} );
	}

	_destroyContext() {
		this.contextWatchdog.destroy();
	}
}

// Properties definition.
Context.propTypes = {
	context: PropTypes.func,
	config: PropTypes.object,
	onReady: PropTypes.func,
	onError: PropTypes.func
};

