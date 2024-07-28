/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { combineCKCdnBundlesPacks } from './combineCKCdnBundlesPacks';
import { createCKCdnBaseBundlePack } from './createCKCdnBaseBundlePack';
import { createCKCdnPremiumBundlePack } from './createCKCdnPremiumBundlePack';

import type { CKCdnVersion } from './createCKCdnUrl';
import {
	loadCKCdnResourcesPack,
	type CKCdnResourcesPack,
	type InferCKCdnResourcesPackExportsType
} from './loadCKCdnResourcesPack';

/**
 * A composable function that loads CKEditor Cloud Services bundles.
 * It returns the exports of the loaded bundles.
 *
 * @param config The configuration of the CKEditor Cloud Services bundles to load.
 * @returns The result of the loaded CKEditor Cloud Services bundles.
 * @template A The type of the additional resources to load.
 * @example
 * ```ts
 * const { CKEditor, CKEditorPremiumFeatures } = await loadCKEditorCloud( {
 * 	version: '42.0.0',
 * 	languages: [ 'en', 'de' ],
 * 	withPremiumFeatures: true
 * } );
 *
 * const { Paragraph } = CKEditor;
 * const { SlashCommands } = CKEditorPremiumFeatures;
 */
export default function loadCKEditorCloud<A extends CKExternalPluginsMap>(
	config: CKEditorCloudConfig<A>
): Promise<CKEditorCloudResult<A>> {
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

	return loadCKCdnResourcesPack( pack ) as Promise<CKEditorCloudResult<A>>;
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
