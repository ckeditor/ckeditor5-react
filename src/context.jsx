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

	_initializeContext() {
		this.contextWatchdog = new ContextWatchdog( this.props.context );

		this.contextWatchdog.create( this.props.config )
			.catch( error => {
				handleError( error );
			} );

		this.contextWatchdog.on( 'error', error => {
			handleError( error );
		} );

		function handleError( error ) {
			if ( this.props.onError ) {
				this.props.onError( error );
			} else {
				console.error( error );
			}
		}
	}

	componentWillUnmount() {
		this._destroyContext();
	}

	_destroyContext() {
		this.contextWatchdog.destroy();
	}
}

// Properties definition.
Context.propTypes = {
	context: PropTypes.func,
	config: PropTypes.object
};
