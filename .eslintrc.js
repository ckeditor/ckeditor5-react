/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
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
		'no-trailing-spaces': 'error',
		'ckeditor5-rules/license-header': [ 'error', { headerLines: [
			'/**',
			' * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.',
			' * For licensing, see LICENSE.md.',
			' */'
		] } ]
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
