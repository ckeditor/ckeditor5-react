/**
 * @license Copyright (c) 2003-2022, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

'use strict';

module.exports = {
	'env': {
		'es6': true,
		'node': true,
		'mocha': true
	},
	'parser': 'babel-eslint',
	'extends': [
		'eslint:recommended',
		'ckeditor5',
		'plugin:react/recommended'
	],
	'globals': {
		'expect': true,
		'sinon': true,
		'shallow': true,
		'mount': true
	},
	'rules': {
		'react/prop-types': 'off',
		'no-console': 'off',
		'no-trailing-spaces': 'error'
	},
	'settings': {
		'react': {
			'version': 'detect'
		}
	},
	'overrides': [
		{
			'files': [
				'**/*.js',
				'**/*.jsx'
			],
			'rules': {
				'ckeditor5-rules/ckeditor-error-message': 'off'
			}
		},
		{
			'files': [
				'tests/**/*.js',
				'tests/**/*.jsx'
			],
			'rules': {
				'no-unused-expressions': 'off'
			}
		}
	]
};
