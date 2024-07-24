/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import type { CKCdnResourcesPack, InferCKCdnResourcesPackExportsType } from './loadCKCdnResourcesPack';

/**
 * Combines multiple CKEditor CDN bundles packs into a single pack.
 *
 * @param packs A map of CKEditor CDN bundles packs.
 * @returns A combined pack of resources for multiple CKEditor CDN bundles.
 * @example
 *
 * ```ts
 * const { Base, Premium } = await loadCKCdnResourcesPack(
 * 	combineCKCdnBundlesPacks( {
 * 		Base: createCKCdnBaseBundlePack( {
 * 			version: '42.0.0',
 * 			languages: [ 'en', 'de' ]
 * 		} ),
 * 		Premium: createCKCdnPremiumBundlePack( {
 * 			version: '42.0.0',
 * 			languages: [ 'en', 'de' ]
 * 		} )
 * 	} )
 * );
 * ```
 */
export const combineCKCdnBundlesPacks = <P extends CKCdnBundlesPacks>( packs: P ): CKCdnCombinedBundlePack<P> => {
	const allPacks = (
		Object
			.values( packs )
			.filter( Boolean )
	) as Array<CKCdnResourcesPack<any>>;

	return {
		// Combine all preloads from all packs into a single array.
		preload: allPacks.flatMap( pack => pack.preload ?? [] ),

		// Combine all scripts from all packs into a single array and preserve order.
		scripts: allPacks.flatMap( pack => pack.scripts ?? [] ),

		// Combine all stylesheets from all packs into a single array and preserve order.
		stylesheets: allPacks.flatMap( pack => pack.stylesheets ?? [] ),

		// Map all exports into one big object.
		getExportedEntries: async () => {
			const exportedGlobalVariables: Record<string, unknown> = {};

			// It can be done sequentially because scripts *should* be loaded at this point and the whole execution should be quite fast.
			for ( const [ name, pack ] of Object.entries( packs ) ) {
				exportedGlobalVariables[ name ] = await pack?.getExportedEntries?.();
			}

			return exportedGlobalVariables as any;
		}
	};
};

/**
 * A map of CKEditor CDN bundles packs.
 */
type CKCdnBundlesPacks = Record<string, CKCdnResourcesPack<any> | undefined>;

/**
 * A combined pack of resources for multiple CKEditor CDN bundles.
 */
type CKCdnCombinedBundlePack<P extends CKCdnBundlesPacks> = CKCdnResourcesPack<{
	[ K in keyof P ]: InferCKCdnResourcesPackExportsType<P[K]>;
}>;
