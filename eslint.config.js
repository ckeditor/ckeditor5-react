/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import globals from 'globals';
import { defineConfig } from 'eslint/config';
import ckeditor5Rules from 'eslint-plugin-ckeditor5-rules';
import ckeditor5Config from 'eslint-config-ckeditor5';
import eslintReact from '@eslint-react/eslint-plugin';
import ts from 'typescript-eslint';

export default defineConfig( [
	{
		ignores: [
			'coverage/**',
			'dist/**',
			'release/**',
			'**/*.d.ts'
		]
	},

	{
		extends: [
			ckeditor5Config,
			eslintReact.configs.recommended
		],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				...globals.browser
			}
		},

		linterOptions: {
			reportUnusedDisableDirectives: 'warn',
			reportUnusedInlineConfigs: 'warn'
		},

		plugins: {
			'ckeditor5-rules': ckeditor5Rules,
			'@typescript-eslint': ts.plugin
		},

		files: [
			'**/*.js',
			'**/*.mjs',
			'**/*.ts',
			'**/*.tsx'
		],

		rules: {
			'@stylistic/func-call-spacing': 'off',
			'@stylistic/function-call-spacing': [ 'error', 'never' ],
			'@stylistic/operator-linebreak': 'off',
			'no-console': 'off',
			'@stylistic/no-trailing-spaces': 'error',
			'ckeditor5-rules/prevent-license-key-leak': 'error',
			'ckeditor5-rules/allow-imports-only-from-main-package-entry-point': 'off',
			'ckeditor5-rules/license-header': [ 'error', { headerLines: [
				'/**',
				' * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.',
				' * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options',
				' */'
			] } ],
			'ckeditor5-rules/require-file-extensions-in-imports': [
				'error',
				{
					extensions: [ '.ts', '.js', '.json' ]
				}
			]
		}
	},

	// The legacy `ReactDOM.render()` API (React 16/17) is used intentionally in the demos and
	// integration tests, so the deprecation rule is disabled there but stays on in `src`.
	{
		files: [ 'demos/**', 'tests/**' ],

		rules: {
			'@eslint-react/dom-no-render': 'off'
		}
	},

	// Rules specific to `tests` folder.
	{
		files: [ 'tests/**' ],

		'rules': {
			'@eslint-react/dom-no-render-return-value': 'off',
			'no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	},

	{
		files: [ 'src/EditorElement.tsx' ],
		rules: {
			'@eslint-react/static-components': 'off'
		}
	},

	// Rules specific to `demos` folder.
	{
		'files': [ 'demos/**' ],
		'rules': {
			'ckeditor5-rules/license-header': 'off'
		}
	},

	// Rules specific to `scripts` folder.
	{
		files: [ 'scripts/**/*' ],

		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},

	// Rules specific to changelog files.
	{
		extends: ckeditor5Config,

		files: [ '.changelog/**/*.md' ],

		plugins: {
			'ckeditor5-rules': ckeditor5Rules
		},

		rules: {
			'ckeditor5-rules/validate-changelog-entry': [ 'error', {
				repositoryType: 'single'
			} ]
		}
	}
] );
