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
		this.contextWatchdog = new ContextWatchdog( this.props.contextConstructor );

		this.contextWatchdog.create( this.props.config );
	}
}

// Properties definition.
Context.propTypes = {
	context: PropTypes.func.required,
	config: PropTypes.object
};

