/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ContextWatchdog from '@ckeditor/ckeditor5-watchdog/src/contextwatchdog';
import CKEditor from './ckeditor.jsx';

export default class Context extends React.Component {
	constructor( props, context ) {
		super( props, context );

		this._initializeContext();
	}

	render() {
		return (
			<>
				{React.Children.map( this.props.children, child => {
					if ( child.type === CKEditor ) {
						return React.cloneElement( child, {
							contextWatchdog: this.contextWatchdog
						} );
					}

					return child;
				} ) }
			</>
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

	_destroyContext() {
		this.contextWatchdog.destroy();
	}
}

// Properties definition.
Context.propTypes = {
	context: PropTypes.func,
	config: PropTypes.object
};

