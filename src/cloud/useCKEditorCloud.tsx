/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	loadCKEditorCloud,
	type CKEditorCloudConfig,
	type CKEditorCloudResult
} from '@ckeditor/ckeditor5-integrations-common';

import { useAsyncValue, type AsyncValueHookResult } from '../hooks/useAsyncValue.js';

/**
 * Hook that loads CKEditor bundles from CDN.
 *
 * @template Config The type of the CKEditor Cloud configuration.
 * @param config The configuration of the hook.
 * @returns The state of async operation that resolves to the CKEditor bundles.
 * @example
 *
 * ```ts
 * const cloud = useCKEditorCloud( {
 * 	version: '42.0.0',
 * 	translations: [ 'es', 'de' ],
 * 	premium: true
 * } );
 *
 * if ( cloud.status === 'success' ) {
 * 	const { ClassicEditor, Bold, Essentials } = cloud.CKEditor;
 * 	const { SlashCommand } = cloud.CKEditorPremiumFeatures;
 * }
 * ```
 */
export default function useCKEditorCloud<Config extends CKEditorCloudConfig>(
	config: Config
): CKEditorCloudHookResult<Config> {
	// Serialize the config to a string to fast compare if there was a change and re-render is needed.
	const serializedConfigKey = JSON.stringify( config );

	// Fetch the CKEditor Cloud Services bundles on every modification of config.
	const result = useAsyncValue(
		async (): Promise<CKEditorCloudResult<Config>> => loadCKEditorCloud( config ),
		[ serializedConfigKey ]
	);

	// Expose a bit better API for the hook consumers, so they don't need to access the constructor through the `data` property.
	if ( result.status === 'success' ) {
		return {
			...result.data,
			status: 'success'
		};
	}

	return result;
}

/**
 * The result of the `useCKEditorCloud` hook. It changes success state to be more intuitive.
 */
type CKEditorCloudHookResult<Config extends CKEditorCloudConfig> =
	| Exclude<AsyncValueHookResult<CKEditorCloudResult<Config>>, { status: 'success' }>
	| ( CKEditorCloudResult<Config> & { status: 'success' } );
