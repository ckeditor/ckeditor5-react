#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

/**
 * Scripts for releasing the package.
 *
 * Before starting the process, "devDependencies" key is removed from package.json.
 */

const path = require( 'path' );
const { tools } = require( '@ckeditor/ckeditor5-dev-utils' );

const packageJsonPath = path.resolve( 'package.json' );
const originalPackageJson = require( packageJsonPath );

Promise.resolve()
	.then( () => {
		tools.updateJSONFile( packageJsonPath, json => {
			delete json.devDependencies;

			return json;
		} );
	} )
	.then( () => {
		return require( '@ckeditor/ckeditor5-dev-env' ).releaseRepository();
	} )
	.then( () => {
		tools.updateJSONFile( packageJsonPath, () => {
			return originalPackageJson;
		} );
	} );

