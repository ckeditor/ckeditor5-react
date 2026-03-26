/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConfig } from 'ckeditor5';

import { getInstalledCKBaseFeatures } from '@ckeditor/ckeditor5-integrations-common';

/**
 * Assigns the `data` property to the correct field in the editor configuration object, depending on the loaded CKEditor version.
 *
 * At this moment, CKEditor 5 might be loaded in two different versions:
 *
 * 1. LTS-one 47.x - It supports both `initialData` and does not support `root.initialData`. It means
 *    that the `data` property should be assigned to `initialData` field in the configuration object.
 *
 * 2. Latest 48.x and newer - It supports `root.initialData` and deprecates `initialData` (which'll be removed in the future).
 *    It means that the `data` property should be assigned to `root.initialData` field in the configuration object.
 *
 * @param data The editor data. It is used to log warnings when both `data` and `initialData` are specified.
 * @param config The editor configuration.
 * @returns Editor config.
 */
export function assignDataPropToSingleRootEditorConfig( data: string | undefined, config: Record<string, any> ): EditorConfig {
	const supports = getInstalledCKBaseFeatures();

	if ( supports.rootsConfigEntry ) {
		// For >= 48.x versions, the `data` property should be assigned to `root.initialData` field in the configuration object.
		const configInitialData =
			config.roots?.main?.initialData ||
			config.root?.initialData ||
			/* legacy */ config.initialData;

		if ( data && configInitialData ) {
			console.warn(
				'Editor data should be provided either using `config.root.initialData` or `data` property. ' +
				'The config value takes precedence over `data` property and will be used when both are specified.'
			);
		}

		const normalizedConfig: any = {
			...config,
			roots: {
				...config.roots,
				main: {
					...config.root,
					...config.roots?.main,
					initialData: configInitialData || data || ''
				}
			}
		};

		delete normalizedConfig.root;
		delete normalizedConfig.initialData;

		return normalizedConfig as unknown as EditorConfig;
	}

	// Fallback for <= 47.x versions which do not support per-root configuration and use `initialData` field.
	const configInitialData = config.initialData;

	if ( data && configInitialData ) {
		console.warn(
			'Editor data should be provided either using `config.initialData` or `data` property. ' +
			'The config value takes precedence over `data` property and will be used when both are specified.'
		);
	}

	return {
		...config,
		initialData: configInitialData || data || ''
	} as unknown as EditorConfig;
}
