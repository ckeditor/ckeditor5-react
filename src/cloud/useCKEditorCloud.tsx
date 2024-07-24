/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { useAsyncValue } from '../hooks/useAsyncValue';

import type { AsyncCallbackState } from '../hooks/useAsyncCallback';
import {
	createCKCdnBaseBundlePack,
	createCKCdnPremiumBundlePack,
	combineCKCdnBundlesPacks,
	loadCKCdnResourcesPack,
	type CKCdnVersion,
	type CKCdnResourcesPack,
	type InferCKCdnResourcesPackExportsType
} from './cdn';

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
		async (): Promise<CKEditorCloudResult<A>> => {
			const { version, languages, withPremiumFeatures, plugins } = config;

			const pack = combineCKCdnBundlesPacks( {
				CKEditor: createCKCdnBaseBundlePack( {
					version,
					languages
				} ),

				...withPremiumFeatures && {
					CKEditorPremiumFeatures: createCKCdnPremiumBundlePack( {
						version,
						languages
					} )
				},

				...plugins && {
					CKPlugins: combineCKCdnBundlesPacks( plugins )
				}
			} );

			return loadCKCdnResourcesPack( pack );
		},
		[ serializedConfigKey ]
	);
}

/**
 * `plugins` property of the `CKEditorCloudConfig`.
 */
export type CKExternalPluginsMap = Record<string, CKCdnResourcesPack<any>>;

/**
 * The result of the resolved bundles from CKEditor Cloud Services.
 *
 * @template A The type of the additional resources to load.
 */
export type CKEditorCloudResult<A extends CKExternalPluginsMap = any> = {

	/**
	 * The base CKEditor bundle exports.
	 */
	CKEditor: Window['CKEDITOR'];

	/**
	 * The CKEditor Premium Features bundle exports.
	 */
	CKEditorPremiumFeatures?: Window['CKEDITOR_PREMIUM_FEATURES'];

	/**
	 * The additional resources exports.
	 */
	CKPlugins?: {
		[ K in keyof A ]: InferCKCdnResourcesPackExportsType<A[K]>
	};
};

/**
 * The configuration of the `useCKEditorCloud` hook.
 *
 * @template A The type of the additional resources to load.
 */
export type CKEditorCloudConfig<A extends CKExternalPluginsMap> = {

	/**
	 * The version of CKEditor Cloud Services to use.
	 */
	version: CKCdnVersion;

	/**
	 * The languages to load.
	 */
	languages?: Array<string>;

	/**
	 * If `true` then the premium features will be loaded.
	 */
	withPremiumFeatures?: boolean;

	/**
	 * Additional resources to load.
	 */
	plugins?: A;
};
