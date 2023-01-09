#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* eslint-env node */

// This scripts run the Karma's server and tests. It does the same job what `karma start` but
// we need to do it manually because options passed by CLI can overwrite the karma configuration
// which produces invalid config.
// See: https://github.com/ckeditor/ckeditor5-react/issues/25

const getKarmaConfig = require( './utils/getkarmaconfig' );
const karma = require( 'karma' );

const KarmaServer = karma.Server;
const parseConfig = karma.config.parseConfig;

const config = getKarmaConfig();
const parsedConfig = parseConfig( null, config, { throwErrors: true } );

const server = new KarmaServer( parsedConfig );

server.start();
