/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
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
		'react/no-deprecated': 'off',
		'no-console': 'off',
		'no-trailing-spaces': 'error',
		'ckeditor5-rules/prevent-license-key-leak': 'error',
		'ckeditor5-rules/allow-imports-only-from-main-package-entry-point': 'off',
		'ckeditor5-rules/license-header': [ 'error', { headerLines: [
			'/**',
			' * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.',
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
				'**/*.jsx',
				'**/*.ts',
				'**/*.tsx'
			],
			'rules': {
				'ckeditor5-rules/ckeditor-error-message': 'off'
			}
		},
		{
			'files': [
				'tests/**/*.js',
				'tests/**/*.jsx',
				'tests/**/*.ts',
				'tests/**/*.tsx'
			],
			'rules': {
				'no-unused-expressions': 'off'
			}
		},
		{
			'files': [
				'demo*/**/*.ts',
				'demo*/**/*.tsx'
			],
			'rules': {
				'ckeditor5-rules/license-header': 'off'
			}
		},
		{
			files: [ '**/tests/**/*.ts', '**/tests/**/*.tsx' ],
			rules: {
				'@typescript-eslint/no-unused-expressions': 'off'
			}
		}
	]
};
