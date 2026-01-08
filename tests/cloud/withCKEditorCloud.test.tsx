/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { type MutableRefObject } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { createDefer } from '@ckeditor/ckeditor5-integrations-common';
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

import withCKEditorCloud, { type WithCKEditorCloudHocProps } from '../../src/cloud/withCKEditorCloud.js';

describe( 'withCKEditorCloud', { timeout: 5000 }, () => {
	const lastRenderedMockProps: MutableRefObject<WithCKEditorCloudHocProps | null> = {
		current: null
	};

	afterEach( () => {
		removeAllCkCdnResources();
		lastRenderedMockProps.current = null;
	} );

	const MockComponent = ( props: WithCKEditorCloudHocProps & { editorId: number } ) => {
		lastRenderedMockProps.current = { ...props };

		return (
			<div>
				Your Editor { props.editorId }
			</div>
		);
	};

	it( 'should inject cloud integration to the wrapped component', async () => {
		const WrappedComponent = withCKEditorCloud( {
			cloud: {
				version: '45.0.0'
			}
		} )( MockComponent );

		const { findByText } = render( <WrappedComponent editorId={ 1 } /> );

		expect( await findByText( 'Your Editor 1' ) ).toBeVisible();
		expect( lastRenderedMockProps.current ).toMatchObject( {
			editorId: 1,
			cloud: expect.objectContaining( {
				CKEditor: expect.objectContaining( {
					ClassicEditor: expect.any( Function )
				} )
			} )
		} );
	} );

	it( 'should show loading spinner when cloud is not ready', async () => {
		const deferredPlugin = createDefer<number>();
		const WrappedComponent = withCKEditorCloud( {
			renderLoader: () => <div>Loading...</div>,
			cloud: {
				version: '45.0.0',
				plugins: {
					Plugin: {
						checkPluginLoaded: () => deferredPlugin.promise
					}
				}
			}
		} )( MockComponent );

		const { findByText } = render( <WrappedComponent editorId={ 1 } /> );

		expect( await findByText( 'Loading...' ) ).toBeVisible();

		deferredPlugin.resolve( 123 );

		expect( await findByText( 'Your Editor 1' ) ).toBeVisible();
		expect( lastRenderedMockProps.current?.cloud.loadedPlugins?.Plugin ).toBe( 123 );
	} );

	it( 'should show error message when cloud loading fails', async () => {
		const WrappedComponent = withCKEditorCloud( {
			renderError: error => <div>Error: { error.message }</div>,
			cloud: {
				version: '45.0.0',
				plugins: {
					Plugin: {
						checkPluginLoaded: () => {
							throw new Error( 'Failed to load plugin' );
						}
					}
				}
			}
		} )( MockComponent );

		const { findByText } = render( <WrappedComponent editorId={ 1 } /> );

		expect( await findByText( 'Error: Failed to load plugin' ) ).toBeVisible();
	} );

	it( 'should render default error message when cloud loading fails and there is no error handler specified', async () => {
		const WrappedComponent = withCKEditorCloud( {
			cloud: {
				version: '45.0.0',
				plugins: {
					Plugin: {
						checkPluginLoaded: () => {
							throw new Error( 'Failed to load plugin' );
						}
					}
				}
			}
		} )( MockComponent );

		const { findByText } = render( <WrappedComponent editorId={ 1 } /> );

		expect( await findByText( 'Unable to load CKEditor Cloud data!' ) ).toBeVisible();
	} );
} );
