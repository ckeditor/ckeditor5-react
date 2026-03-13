/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	destructureSemanticVersion,
	getCKBaseBundleInstallationInfo,
	isSemanticVersion
} from '@ckeditor/ckeditor5-integrations-common';

import type { EditorConfig } from 'ckeditor5';

/**
 * Normalizes the editor configuration to make it compatible with all CKEditor 5 versions.
 *
 * At this moment, CKEditor 5 might be loaded in three different versions:
 *
 * 1. LTS-one 47.x - It supports both `initialData` and does not support `root.initialData`. It means
 *    that the `data` property should be assigned to `initialData` field in the configuration object.
 *
 * 2. Latest 48.x and newer - It supports `root.initialData` and deprecates `initialData` (which'll be removed in the future).
 *    It means that the `data` property should be assigned to `root.initialData` field in the configuration object.
 *
 * @param config The editor configuration.
 * @param data The editor data. It is used to log warnings when both `data` and `initialData` are specified.
 */
export function normalizeConfiguration( config: EditorConfig, data?: string | Record<string, string> | undefined ): any {
	let normalizedConfig: any = { ...config };

	if ( isRootsMapConfigurationSupported() ) {
		// For >= 48.x versions, the `data` property should be assigned to `root.initialData` field in the configuration object.
		const configInitialData =
			normalizedConfig.roots?.main?.initialData ||
			normalizedConfig.root?.initialData ||
			/* legacy */ normalizedConfig.initialData;

		if ( data && configInitialData ) {
			console.warn(
				'Editor data should be provided either using `config.root.initialData` or `data` property. ' +
				'The config value takes precedence over `data` property and will be used when both are specified.'
			);
		}

		delete normalizedConfig.root;
		delete normalizedConfig.initialData;

		normalizedConfig = {
			...normalizedConfig,
			roots: {
				...normalizedConfig.roots,
				main: {
					...normalizedConfig.roots?.main,
					initialData: configInitialData || data || ''
				}
			}
		};
	} else {
		// Fallback for <= 47.x versions which do not support per-root configuration and use `initialData` field.
		const configInitialData = normalizedConfig.initialData;

		if ( data && configInitialData ) {
			console.warn(
				'Editor data should be provided either using `config.initialData` or `data` property. ' +
				'The config value takes precedence over `data` property and will be used when both are specified.'
			);
		}

		normalizedConfig = {
			...normalizedConfig,
			initialData: configInitialData || data || ''
		};
	}

	return normalizedConfig;
}

/**
 * Retrieve information about the base CKEditor bundle installation and checks if it supports per-root configuration.
 * It may return `null` if the editor is not loaded yet, or something else removed global editor versions variable.
 * In such case, we will assume that the loaded CKEditor version is compatible with all newest features
 * and use `root.initialData` field.
 *
 * @returns `true` if the loaded CKEditor version supports per-root configuration, `false` otherwise.
 */
export function isRootsMapConfigurationSupported(): boolean {
	const bundleInfo = getCKBaseBundleInstallationInfo();

	// If it's nightly, internal, or any other version, assume it's compatible with all newest features.
	// Versions >= 48 prefer to use `root.initialData` instead of `initialData` field, so we need to normalize
	// the configuration object to make it work with all versions.
	return (
		!bundleInfo ||
		!isSemanticVersion( bundleInfo.version ) ||
		destructureSemanticVersion( bundleInfo.version ).major >= 48
	);
}
