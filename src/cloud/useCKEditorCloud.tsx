/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useAsyncValue } from '../hooks/useAsyncValue';
import loadCKEditorCloud, { type CKExternalPluginsMap } from './cdn/loadCKEditorCloud';

import type { AsyncCallbackState } from '../hooks/useAsyncCallback';
import type { CKEditorCloudConfig, CKEditorCloudResult } from './cdn';

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
 * 	withPremiumFeatures: true
 * } );
 *
 * if ( cloud.status === 'success' ) {
 * 	const { ClassicEditor, Bold, Essentials } = cloud.data.CKEditor;
 * 	const { SlashCommand } = cloud.data.CKEditorPremiumFeatures;
 * }
 * ```
 */
export default function useCKEditorCloud<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): AsyncCallbackState<CKEditorCloudResult<A>> {
	// Serialize the config to a string to fast compare if there was a change and re-render is needed.
	const serializedConfigKey = JSON.stringify( config );

	// Fetch the CKEditor Cloud Services bundles on every modification of config.
	return useAsyncValue(
		async (): Promise<CKEditorCloudResult<A>> => loadCKEditorCloud( config ),
		[ serializedConfigKey ]
	);
}
