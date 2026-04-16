/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { webdriverio } from '@vitest/browser-webdriverio';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };

const INTEGRATION_TESTS = [
	'tests/integrations/**/*.test.tsx',
	'tests/issues/39-frozen-browser.test.tsx',
	'tests/issues/349-destroy-context-and-editor.test.tsx',
	'tests/issues/354-destroy-editor-inside-context.test.tsx',
	'tests/multiroot/useMultiRootEditor.test.tsx'
];

export default defineConfig( ( { mode } ) => {
	const env = loadEnv( mode, __dirname, '' );
	const REACT_VERSION = Number( process.env.REACT_VERSION ) || 18;
	const TEST_SCOPE = process.env.TEST_SCOPE;
	const CKEDITOR_LICENSE_KEY = process.env.CKEDITOR_LICENSE_KEY || env.CKEDITOR_LICENSE_KEY || 'GPL';

	return {
		plugins: [
			react( { jsxRuntime: 'classic' } )
		],

		publicDir: false,

		optimizeDeps: {
			include: [ 'react-dom/client' ]
		},

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
			restoreMocks: true,
			clearMocks: true,
			mockReset: true,
			unstubEnvs: true,
			unstubGlobals: true,
			setupFiles: [ './vitest-setup.ts' ],
			include: TEST_SCOPE === 'integration' ? INTEGRATION_TESTS : [ 'tests/**/*.test.[j|t]sx' ],
			exclude: TEST_SCOPE === 'non-integration' ? INTEGRATION_TESTS : [],
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
				provider: webdriverio(),
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
				'react-dom/client': resolve(
					__dirname,
					`node_modules/react${ REACT_VERSION }-dom${ REACT_VERSION <= 17 ? '' : '/client' }`
				),
				'react-dom': resolve( __dirname, `node_modules/react${ REACT_VERSION }-dom` )
			}
		},

		preview: {
			port: 8080,
			strictPort: true,
			cors: true,
			host: true
		},

		define: {
			__CKEDITOR_LICENSE_KEY__: JSON.stringify( CKEDITOR_LICENSE_KEY ),
			__REACT_VERSION__: REACT_VERSION,
			__REACT_INTEGRATION_VERSION__: JSON.stringify( pkg.version )
		}
	};
} );
