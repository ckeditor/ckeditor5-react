/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	loadCKEditorCloud,
	type CKEditorCloudConfig,
	type CKEditorCloudResult,
	type CdnPluginsPacks
} from '@ckeditor/ckeditor5-integrations-common';

import { useAsyncValue, type AsyncValueHookResult } from '../hooks/useAsyncValue';

/**
 * Hook that loads CKEditor bundles from CDN.
 *
 * @template A The type of the additional resources to load.
 * @param config The configuration of the hook.
 * @returns The state of async operation that resolves to the CKEditor bundles.
 * @example
 *
 * ```ts
 * const cloud = useCKEditorCloud( {
 * 	version: '42.0.0',
 * 	languages: [ 'en', 'de' ],
 * 	premium: true
 * } );
 *
 * if ( cloud.status === 'success' ) {
 * 	const { ClassicEditor, Bold, Essentials } = cloud.CKEditor;
 * 	const { SlashCommand } = cloud.CKEditorPremiumFeatures;
 * }
 * ```
 */
export default function useCKEditorCloud<A extends CdnPluginsPacks>(
	config: CKEditorCloudConfig<A>
): CKEditorCloudHookResult<A> {
	// Serialize the config to a string to fast compare if there was a change and re-render is needed.
	const serializedConfigKey = JSON.stringify( config );

	// Fetch the CKEditor Cloud Services bundles on every modification of config.
	const result = useAsyncValue(
		async (): Promise<CKEditorCloudResult<A>> => loadCKEditorCloud( config ),
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
type CKEditorCloudHookResult<A extends CdnPluginsPacks> =
	| Exclude<AsyncValueHookResult<CKEditorCloudResult<A>>, { status: 'success' }>
	| ( CKEditorCloudResult<A> & { status: 'success' } );