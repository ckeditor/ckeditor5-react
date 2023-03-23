/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
		'no-console': 'off',
		'no-trailing-spaces': 'error',
		'ckeditor5-rules/license-header': [ 'error', { headerLines: [
			'/**',
			' * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.',
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
				'demo/**/*.ts',
				'demo/**/*.tsx'
			],
			'rules': {
				'ckeditor5-rules/license-header': 'off'
			}
		},
		// TODO this is a copy from
		//  https://github.com/ckeditor/ckeditor5-linters-config/blob/master/packages/eslint-config-ckeditor5/.eslintrc.js#L330
		//  only extended with .tsx
		{
			files: [ '**/*.ts', '**/*.tsx' ],
			plugins: [
				'@typescript-eslint',
				'ckeditor5-rules',
				'mocha'
			],
			parser: '@typescript-eslint/parser',
			extends: [
				'eslint:recommended',
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended'
			],
			rules: {
				'@typescript-eslint/array-type': [
					'error',
					{ default: 'generic' }
				],
				'@typescript-eslint/ban-types': [
					'error',
					{
						types: { Function: false },
						extendDefaults: true
					}
				],

				'@typescript-eslint/consistent-type-assertions': [
					'error',
					{
						assertionStyle: 'as',
						objectLiteralTypeAssertions: 'allow-as-parameter'
					}
				],

				'@typescript-eslint/consistent-type-imports': 'error',

				'@typescript-eslint/explicit-module-boundary-types': [
					'error',
					{ allowArgumentsExplicitlyTypedAsAny: true }
				],

				'@typescript-eslint/explicit-member-accessibility': [
					'error',
					{
						accessibility: 'explicit',
						overrides: {
							constructors: 'off'
						}
					}
				],

				'@typescript-eslint/member-delimiter-style': 'error',

				'@typescript-eslint/no-confusing-non-null-assertion': 'error',

				'@typescript-eslint/no-empty-function': 'off',

				'@typescript-eslint/no-empty-interface': 'off',

				'@typescript-eslint/no-explicit-any': 'off',

				'@typescript-eslint/no-inferrable-types': 'off',

				'@typescript-eslint/no-invalid-void-type': 'error',

				'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',

				'@typescript-eslint/no-non-null-assertion': 'off',

				'@typescript-eslint/parameter-properties': 'error',

				'@typescript-eslint/type-annotation-spacing': 'error',

				'@typescript-eslint/unified-signatures': 'error',

				// typescript-eslint extension rules (intended to be compatible with those for .js):

				'no-unused-expressions': 'off',
				'@typescript-eslint/no-unused-expressions': 'error',

				'no-use-before-define': 'off',
				'@typescript-eslint/no-use-before-define': [
					'error',
					{
						functions: false,
						classes: false,
						variables: true,
						typedefs: false,
						ignoreTypeReferences: true
					}
				],

				'comma-dangle': 'off',
				'@typescript-eslint/comma-dangle': [ 'error', 'never' ],

				'comma-spacing': 'off',
				'@typescript-eslint/comma-spacing': [
					'error',
					{
						before: false,
						after: true
					}
				],

				'func-call-spacing': 'off',
				'@typescript-eslint/func-call-spacing': [ 'error', 'never' ],

				'keyword-spacing': 'off',
				'@typescript-eslint/keyword-spacing': 'error',

				'no-array-constructor': 'off',
				'@typescript-eslint/no-array-constructor': 'error',

				'object-curly-spacing': 'off',
				'@typescript-eslint/object-curly-spacing': [ 'error', 'always' ],

				'quotes': 'off',
				'@typescript-eslint/quotes': [ 'error', 'single' ],

				'semi': 'off',
				'@typescript-eslint/semi': 'error',

				'space-before-blocks': 'off',
				'@typescript-eslint/space-before-blocks': [ 'error', 'always' ],

				'space-before-function-paren': 'off',
				'@typescript-eslint/space-before-function-paren': [
					'error',
					{
						anonymous: 'never',
						named: 'never',
						asyncArrow: 'always'
					}
				],

				'space-infix-ops': 'off',
				'@typescript-eslint/space-infix-ops': 'error',

				'no-useless-constructor': 'off',
				'@typescript-eslint/no-useless-constructor': 'error'
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
