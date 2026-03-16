/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { EditorConfig } from 'ckeditor5';

import {
	destructureSemanticVersion,
	getCKBaseBundleInstallationInfo,
	isSemanticVersion,
	uniq
} from '@ckeditor/ckeditor5-integrations-common';

/**
 * Assigns the `data` property to the correct field in the editor configuration object, depending on the loaded CKEditor version.
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
export function assignDataPropToSingleRootEditorConfig( config: Record<string, any>, data: string | undefined ): EditorConfig {
	if ( isRootsMapConfigurationSupported() ) {
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

/**
 * Assigns the `data` property to the correct field in the editor configuration object for multi-root editors,
 * depending on the loaded CKEditor version.
 *
 * The version compatibility matrix is the same as in `assignDataPropToSingleRootEditorConfig`.
 *
 * @param config The editor configuration.
 * @param data The editor data. It is used to log warnings when both `data`
 * and `config.roots[<root name>].initialData` are specified.
 * @param attributes The editor roots attributes. It is used to log warnings when both `attributes`
 * and `config.roots[<root name>].modelElement.attributes` are specified.
 * @returns The editor configuration with assigned `data` property.
 */
export function assignMultiRootDataPropToEditorConfig(
	config: Record<string, any>,
	data: Record<string, string>,
	attributes?: Record<string, Record<string, any>> | undefined
): EditorConfig {
	// For >= 48.x versions, the `data` property should be assigned to `root.initialData` field in the configuration object.
	if ( isRootsMapConfigurationSupported() ) {
		const hasDefinedRootsInitialData = !!config.roots && Object
			.values( config.roots )
			.some( ( val: any ) => typeof val?.initialData === 'string' );

		if ( data && hasDefinedRootsInitialData ) {
			console.warn(
				'Editor data should be provided either using `config.roots.<root name>.initialData` or `data` property. ' +
				'The config value takes precedence over `data` property and will be used when both are specified.'
			);
		}

		const knownRootsKeys = uniq( [
			...Object.keys( attributes || {} ),
			...Object.keys( data ),
			...Object.keys( config.roots || {} )
		] );

		const roots = knownRootsKeys.reduce( ( acc, rootName ) => {
			const configRootValue = ( config as any ).roots?.[ rootName ];

			acc[ rootName ] = {
				...configRootValue,
				initialData: configRootValue?.initialData || data?.[ rootName ] || '',
				modelAttributes: attributes?.[ rootName ] || configRootValue?.modelAttributes || {}
			};

			return acc;
		}, Object.create( null ) );

		return {
			...config,
			roots
		} as unknown as EditorConfig;
	}

	// Fallback for <= 47.x versions which do not support per-root configuration and use `initialData` field.
	if ( data && config.initialData ) {
		console.warn(
			'Editor data should be provided either using `config.initialData` or `data` property. ' +
			'The config value takes precedence over `data` property and will be used when both are specified.'
		);
	}

	return {
		...config,
		rootsAttributes: attributes
	} as unknown as EditorConfig;
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
