/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );
const { bundler } = require( '@ckeditor/ckeditor5-dev-utils' );
const TerserPlugin = require( 'terser-webpack-plugin' );

module.exports = {
	context: __dirname,

	devtool: 'source-map',
	performance: { hints: false },
	externals: {
		react: {
			root: 'React',
			commonjs2: 'react',
			commonjs: 'react',
			amd: 'react'
		}
	},

	entry: [require.resolve( 'regenerator-runtime/runtime.js' ),path.resolve( __dirname, 'src', 'index.js' )],

	output: {
		library: 'CKEditor',

		path: path.join( __dirname, 'dist' ),
		filename: 'ckeditor.js',
		libraryTarget: 'umd'
	},
	// target: ['web', 'es5'],

	optimization: {
		minimizer: [
			new TerserPlugin( {
				sourceMap: true,
				terserOptions: {
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			} )
		]
	},

	plugins: [
		new webpack.BannerPlugin( {
			banner: bundler.getLicenseBanner(),
			raw: true
		} )
	],

	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [ require( '@babel/preset-env' ) ,'@babel/preset-react' ]
						}
					}
				]
			},
			{
				test: /\.jsx$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					compact: false,
					presets: [ '@babel/preset-react' ]
				}
			}
		]
	}
};
