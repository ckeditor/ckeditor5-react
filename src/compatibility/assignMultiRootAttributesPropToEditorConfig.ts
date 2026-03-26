/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConfig } from 'ckeditor5';

import { getInstalledCKBaseFeatures, uniq } from '@ckeditor/ckeditor5-integrations-common';

/**
 * Assigns the `attributes` property to the correct field in the editor configuration object, depending on the loaded CKEditor version.
 *
 * The version compatibility matrix is the same as in `assignDataPropToSingleRootEditorConfig`.
 *
 * @param attributes The editor roots attributes.
 * @param config The editor configuration.
 * @returns The editor configuration with assigned `attributes` property.
 */
export function assignMultiRootAttributesPropToEditorConfig(
	attributes: Record<string, Record<string, any>> | undefined,
	config: Record<string, any>
): EditorConfig {
	const supports = getInstalledCKBaseFeatures();

	// For >= 48.x versions, the `attributes` property should be assigned to `root.modelAttributes` field in the configuration object.
	if ( supports.rootsConfigEntry ) {
		const knownRootsKeys = uniq( [
			...Object.keys( attributes || {} ),
			...Object.keys( config.roots || {} )
		] );

		const roots = knownRootsKeys.reduce( ( acc, rootName ) => {
			const configRootValue = ( config as any ).roots?.[ rootName ];

			acc[ rootName ] = {
				...configRootValue,
				modelAttributes: attributes?.[ rootName ] || configRootValue?.modelAttributes || {}
			};

			return acc;
		}, Object.create( null ) );

		return {
			...config,
			roots
		} as unknown as EditorConfig;
	}

	// Fallback for <= 47.x versions which uses `rootsAttributes` field in the configuration object.
	return {
		...config,
		rootsAttributes: attributes
	} as unknown as EditorConfig;
}
