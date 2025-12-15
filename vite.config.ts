/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

const REACT_VERSION = Number( process.env.REACT_VERSION ) || 18;

export default defineConfig( {
	plugins: [
		react( { jsxRuntime: 'classic' } )
	],

	publicDir: false,

	build: {
		minify: false,
		sourcemap: true,
		target: 'es2019',

		// https://vitejs.dev/guide/build#library-mode
		lib: {
			entry: resolve( __dirname, 'src/index.ts' ),
			name: 'CKEDITOR_REACT',
			fileName: 'index'
		},

		rollupOptions: {
			external: Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} ),

			output: {
				globals: {
					'react': 'React',
					'@ckeditor/ckeditor5-integrations-common': 'CKEDITOR_INTEGRATIONS_COMMON'
				}
			}
		}
	},

	// https://vitest.dev/config/
	test: {
		setupFiles: [ './vitest-setup.ts' ],
		include: [
			'tests/**/*.test.[j|t]sx'
		],
		coverage: {
			provider: 'istanbul',
			include: [ 'src/*' ],
			exclude: [ 'src/demos' ],
			thresholds: {
				branches: 100,
				functions: 100,
				lines: 100,
				statements: 100
			},
			reporter: [
				'text-summary',
				'text',
				'html',
				'lcovonly',
				'json'
			]
		},
		browser: {
			enabled: true,
			headless: true,
			provider: 'webdriverio',
			screenshotFailures: false,
			instances: [
				{ browser: 'chrome' }
			]
		}
	},

	/**
	 * Code needed to run the demos using different React versions.
	 *
	 * Notice that in `package.json`, aside from the regular `react` and `react-dom` dependencies,
	 * there are also:
	 *
	 * - `react16` and `react16-dom`,
	 * - `react18` and `react18-dom`,
	 * - `react19` and `react19-dom`.
	 *
	 * These point to the respective React versions, and are used to test the demos with different
	 * React versions, depending on the `REACT_VERSION` environment variable.
	 */
	resolve: {
		alias: {
			'react': resolve( __dirname, `node_modules/react${ REACT_VERSION }` ),
			'react-dom/client': resolve( __dirname, `node_modules/react${ REACT_VERSION }-dom${ REACT_VERSION <= 17 ? '' : '/client' }` ),
			'react-dom': resolve( __dirname, `node_modules/react${ REACT_VERSION }-dom` )
		}
	},

	define: {
		__REACT_VERSION__: REACT_VERSION,
		__REACT_INTEGRATION_VERSION__: JSON.stringify( pkg.version )
	}
} );
