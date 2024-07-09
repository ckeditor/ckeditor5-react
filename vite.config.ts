/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { resolve } from 'path';
import { createRequire } from 'module';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

declare global {
	const __REACT_VERSION__: number;
}

const require = createRequire( import.meta.url );
const pkg = require( './package.json' );

const REACT_VERSION = Number( process.env.REACT_VERSION ) || 18;

export default defineConfig( {
	plugins: [
		react()
	],

	build: {
		minify: false,
		sourcemap: true,

		// https://vitejs.dev/guide/build#library-mode
		lib: {
			entry: resolve( __dirname, 'src/index.ts' ),
			name: 'CKEditor',
			fileName: 'ckeditor',
			formats: [ 'es' ]
		},

		rollupOptions: {
			external: Object.keys( {
				...pkg.dependencies,
				...pkg.peerDependencies
			} )
		}
	},

	// https://vitest.dev/config/
	test: {
		include: [
			'tests/**/*.test.[j|t]sx'
		],
		coverage: {
			provider: 'istanbul',
			include: [ 'src/*' ],
			exclude: [ 'src/demos' ],
			thresholds: {
				100: true
			},
			reporter: [
				'text-summary',
				'html',
				'lcovonly',
				'json'
			]
		},
		browser: {
			enabled: true,
			headless: true,
			provider: 'webdriverio',
			name: 'chrome'
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
			'react-dom/client': resolve( __dirname, `node_modules/react${ REACT_VERSION }-dom${ REACT_VERSION === 16 ? '' : '/client' }` ),
			'react-dom': resolve( __dirname, `node_modules/react${ REACT_VERSION }-dom` )
		}
	},

	define: {
		__REACT_VERSION__: REACT_VERSION
	}
} );
