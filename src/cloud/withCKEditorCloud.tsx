/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type ReactNode, type ComponentType } from 'react';
import type {
	CKEditorCloudConfig,
	CKEditorCloudResult
} from '@ckeditor/ckeditor5-integrations-common';

import useCKEditorCloud from './useCKEditorCloud.js';

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
 * 		translations: [ 'es', 'de' ],
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
const withCKEditorCloud = <Config extends CKEditorCloudConfig>( config: CKEditorCloudHocConfig<Config> ) =>
	<P extends object>(
		WrappedComponent: ComponentType<WithCKEditorCloudHocProps<Config> & P>
	): ComponentType<Omit<P, keyof WithCKEditorCloudHocProps<Config>>> => {
		const ComponentWithCKEditorCloud = ( props: Omit<P, keyof WithCKEditorCloudHocProps<Config>> ) => {
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
 * @template Config The configuration of the CKEditor Cloud integration.
 */
export type WithCKEditorCloudHocProps<Config extends CKEditorCloudConfig = CKEditorCloudConfig> = {

	/**
	 * The result of the CKEditor Cloud integration.
	 */
	cloud: CKEditorCloudResult<Config>;
};

/**
 * The configuration of the CKEditor Cloud integration.
 *
 * @template Config The configuration of the CKEditor Cloud integration.
 */
type CKEditorCloudHocConfig<Config extends CKEditorCloudConfig> = {

	/**
	 * The configuration of the CKEditor Cloud integration.
	 */
	cloud: Config;

	/**
	 * Component to render while the cloud information is being fetched.
	 */
	renderLoader?: () => ReactNode;

	/**
	 * Component to render when an error occurs while fetching the cloud information.
	 */
	renderError?: ( error: any ) => ReactNode;
};
