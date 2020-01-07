/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );

const options = parseArguments( process.argv.slice( 2 ) );

module.exports = function getKarmaConfig() {
	const basePath = process.cwd();
	const coverageDir = path.join( basePath, 'coverage' );

	const webpackConfig = {
		mode: 'development',

		module: {
			rules: [
				{
					test: /\.jsx$/,
					loader: 'babel-loader',
					query: {
						compact: false,
						presets: [ '@babel/preset-react' ]
					}
				}
			]
		}
	};

	const karmaConfig = {
		basePath,

		frameworks: [ 'mocha', 'chai', 'sinon' ],

		files: [
			// If the file below is imported in tests directly, it leads to an error related to CKEDITOR_VERSION collision.
			// It may be related to presets that are required for *.jsx files.
			require.resolve( '@ckeditor/ckeditor5-build-classic' ),
			'tests/**/*.js',
			'tests/**/*.jsx'
		],

		preprocessors: {
			'tests/**/*.js': [ 'webpack' ],
			'tests/**/*.jsx': [ 'webpack' ]
		},

		webpack: webpackConfig,

		webpackMiddleware: {
			noInfo: true,
			stats: 'minimal'
		},

		reporters: [ options.reporter ],

		port: 9876,

		colors: true,

		logLevel: 'INFO',

		browsers: getBrowsers( options.browsers ),

		customLaunchers: {
			CHROME_TRAVIS_CI: {
				base: 'Chrome',
				flags: [ '--no-sandbox', '--disable-background-timer-throttling' ]
			},
			CHROME_LOCAL: {
				base: 'Chrome',
				flags: [ '--disable-background-timer-throttling' ]
			}
		},

		singleRun: true,

		concurrency: Infinity,

		browserNoActivityTimeout: 0,

		mochaReporter: {
			showDiff: true
		}
	};

	if ( options.watch ) {
		karmaConfig.autoWatch = true;
		karmaConfig.singleRun = false;
	}

	if ( options.coverage ) {
		karmaConfig.reporters.push( 'coverage' );

		if ( process.env.TRAVIS ) {
			karmaConfig.reporters.push( 'coveralls' );
		}

		karmaConfig.coverageReporter = {
			reporters: [
				// Prints a table after tests result.
				{
					type: 'text-summary'
				},
				// Generates HTML tables with the results.
				{
					dir: coverageDir,
					type: 'html'
				},
				// Generates "lcov.info" file. It's used by external code coverage services.
				{
					type: 'lcovonly',
					dir: coverageDir
				}
			]
		};

		webpackConfig.module.rules.push( {
			test: /\.jsx?$/,
			loader: 'istanbul-instrumenter-loader',
			include: /src/,
			exclude: [
				/node_modules/
			],
			query: {
				esModules: true
			}
		} );
	}

	if ( options.sourceMap ) {
		karmaConfig.preprocessors[ 'tests/**/*.js' ].push( 'sourcemap' );
		karmaConfig.preprocessors[ 'tests/**/*.jsx' ].push( 'sourcemap' );

		webpackConfig.devtool = 'inline-source-map';
	}

	return karmaConfig;
};

/**
 * Returns the value of Karma's browser option.
 *
 * @param {Array.<String>} browsers
 * @returns {Array.<String>|null}
 */
function getBrowsers( browsers ) {
	if ( !browsers ) {
		return null;
	}

	return browsers.map( browser => {
		if ( browser !== 'Chrome' ) {
			return browser;
		}

		return process.env.TRAVIS ? 'CHROME_TRAVIS_CI' : 'CHROME_LOCAL';
	} );
}

/**
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {Object} options
 * @returns {Array.<String>} options.browsers Browsers that will be used to run tests.
 * @returns {String} options.reporter A reporter that will presents tests results.
 * @returns {Boolean} options.watch Whether to watch the files.
 * @returns {Boolean} options.coverage Whether to generate code coverage.
 * @returns {Boolean} options.sourceMap Whether to add source maps.
 */
function parseArguments( args ) {
	const minimist = require( 'minimist' );

	const config = {
		string: [
			'browsers',
			'reporter'
		],

		boolean: [
			'watch',
			'coverage',
			'source-map'
		],

		alias: {
			b: 'browsers',
			c: 'coverage',
			r: 'reporter',
			s: 'source-map',
			w: 'watch',
		},

		default: {
			browsers: 'Chrome',
			reporter: 'mocha',
			watch: false,
			coverage: false,
			'source-map': false,
		}
	};

	const options = minimist( args, config );

	options.sourceMap = options[ 'source-map' ];
	options.browsers = options.browsers.split( ',' );

	// Delete all aliases because we don't want to use them in the code.
	// They are useful when calling command but useless after that.
	for ( const alias of Object.keys( config.alias ) ) {
		delete options[ alias ];
	}

	return options;
}
