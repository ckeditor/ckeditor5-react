/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConfig } from 'ckeditor5';
import { getInstalledCKBaseFeatures, uniq } from '@ckeditor/ckeditor5-integrations-common';

import type { EditorRelaxedConfig } from '../types/EditorRelaxedConfig.js';

/**
 * Assigns the `initialData` property to multiroot configuration.
 *
 * @param data The editor data to be assigned.
 * @param config The editor configuration.
 * @returns The editor configuration with assigned `initialData` property.
 */
export function assignDataPropToMultiRootEditorConfig(
	data: Record<string, string> | undefined,
	config: EditorRelaxedConfig
): EditorRelaxedConfig {
	const supports = getInstalledCKBaseFeatures();

	// For >= 48.x versions, the `initialData` property should be assigned to `root.initialData` field in the configuration object.
	if ( supports.rootsConfigEntry ) {
		const knownRootsKeys = uniq( [
			...Object.keys( data || {} ),
			...Object.keys( config.roots || {} )
		] );

		const roots = knownRootsKeys.reduce( ( acc, rootName ) => {
			const rootConfig = config.roots?.[ rootName ];
			const rootInitialData = rootConfig?.initialData;

			if ( rootInitialData && data?.[ rootName ] ) {
				console.warn(
					`Editor data should be provided either using \`config.roots['${ rootName }'].initialData\` or \`data\` property. ` +
					'The config value takes precedence over `data` property and will be used when both are specified.'
				);
			}

			acc[ rootName ] = {
				...rootConfig,
				initialData: rootInitialData || data?.[ rootName ] || ''
			};

			return acc;
		}, Object.create( null ) );

		return {
			...config,
			roots
		} as unknown as EditorConfig;
	}

	// Fallback for <= 47.x versions which uses `initialData` field in the configuration object.
	if ( data && config?.initialData ) {
		console.warn(
			'Editor data should be provided either using `config.initialData` or `data` property. ' +
			'The config value takes precedence over `data` property and will be used when both are specified.'
		);
	}

	return {
		...config,
		initialData: config?.initialData || data
	} as unknown as EditorConfig;
}
