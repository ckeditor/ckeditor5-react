/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import React, { type ReactNode, type ComponentType } from 'react';
import type {
	CKEditorCloudConfig,
	CKEditorCloudResult,
	CdnPluginsPacks
} from '@ckeditor/ckeditor5-integrations-common';

import useCKEditorCloud from './useCKEditorCloud';

/**
 * HOC that injects the CKEditor Cloud integration into a component.
 *
 * @template A The type of the additional resources to load.
 * @param config The configuration of the CKEditor Cloud integration.
 * @returns A function that injects the CKEditor Cloud integration into a component.
 * @example

 * ```tsx
 * const withCKCloud = withCKEditorCloud( {
 * 	cloud: {
 * 		version: '42.0.0',
 * 		languages: [ 'en', 'de' ],
 * 		premium: true
 * 	}
 * } );
 *
 * const MyComponent = withCKCloud( ( { cloud } ) => {
 * 	const { Paragraph } = cloud.CKEditor;
 * 	const { SlashCommands } = cloud.CKEditorPremiumFeatures;
 * 	const { YourPlugin } = cloud.CKPlugins;
 *
 * 	return <div>CKEditor Cloud is loaded!</div>;
 * } );
 * ```
 */
const withCKEditorCloud = <A extends CdnPluginsPacks>( config: CKEditorCloudHocConfig<A> ) =>
	<P extends object>(
		WrappedComponent: ComponentType<WithCKEditorCloudHocProps<A> & P>
	): ComponentType<Omit<P, keyof WithCKEditorCloudHocProps>> => {
		const ComponentWithCKEditorCloud = ( props: Omit<P, keyof WithCKEditorCloudHocProps> ) => {
			const ckeditorCloudResult = useCKEditorCloud( config.cloud );

			switch ( ckeditorCloudResult.status ) {
				// An error occurred while fetching the cloud information.
				case 'error':
					if ( !config.renderError ) {
						return 'Unable to load CKEditor Cloud data!';
					}

					return config.renderError( ckeditorCloudResult.error );

				// The cloud information has been fetched successfully.
				case 'success':
					return <WrappedComponent {...props as P} cloud={ ckeditorCloudResult } />;

				// The cloud information is being fetched.
				default:
					return config.renderLoader?.() ?? null;
			}
		};

		ComponentWithCKEditorCloud.displayName = 'ComponentWithCKEditorCloud';

		return ComponentWithCKEditorCloud;
	};

export default withCKEditorCloud;

/**
 * Props injected by the `withCKEditorCloud` HOC.
 *
 * @template A The type of the additional resources to load.
 */
export type WithCKEditorCloudHocProps<A extends CdnPluginsPacks = any> = {

	/**
	 * The result of the CKEditor Cloud integration.
	 */
	cloud: CKEditorCloudResult<A>;
};

/**
 * The configuration of the CKEditor Cloud integration.
 *
 * @template A The type of the additional resources to load.
 */
type CKEditorCloudHocConfig<A extends CdnPluginsPacks> = {

	/**
	 * The configuration of the CKEditor Cloud integration.
	 */
	cloud: CKEditorCloudConfig<A>;

	/**
	 * Component to render while the cloud information is being fetched.
	 */
	renderLoader?: () => ReactNode;

	/**
	 * Component to render when an error occurs while fetching the cloud information.
	 */
	renderError?: ( error: any ) => ReactNode;
};
