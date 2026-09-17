/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { getCKCdnClassicEditor } from './getCKCdnClassicEditor.js';
import { CKEditor, useCKEditorCloud } from '../../src/index.js';

const SHADOW_ROOTS = new WeakMap<Element, ShadowRoot>();

type CKEditorShadowRootCloudDemoProps = {
	content: string;
	mode: ShadowRootMode;
};

export const CKEditorShadowRootCloudDemo = ( { content, mode }: CKEditorShadowRootCloudDemoProps ): ReactNode => {
	const [ shadowRoot, setShadowRoot ] = useState<ShadowRoot | null>( null );

	const hostRef = useCallback( ( host: HTMLDivElement | null ) => {
		if ( host ) {
			setShadowRoot( attachShadowRoot( host, mode ) );
		}
	}, [ mode ] );

	return (
		<>
			<div ref={ hostRef } />

			{ shadowRoot && createPortal(
				<ShadowRootEditor shadowRoot={ shadowRoot } content={ content } />,
				shadowRoot
			) }
		</>
	);
};

function attachShadowRoot( host: HTMLDivElement, mode: ShadowRootMode ): ShadowRoot {
	let shadowRoot = SHADOW_ROOTS.get( host );

	if ( !shadowRoot ) {
		shadowRoot = host.attachShadow( { mode } );
		SHADOW_ROOTS.set( host, shadowRoot );
	}

	return shadowRoot;
}

function ShadowRootEditor( { shadowRoot, content }: { shadowRoot: ShadowRoot; content: string } ): ReactNode {
	const cloud = useCKEditorCloud( {
		version: 'nightly',
		injectedStylesheetsLocation: {
			targetNode: shadowRoot,
			placement: 'end'
		}
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );

		return <div>Error!</div>;
	}

	if ( cloud.status !== 'success' ) {
		return <div>Loading...</div>;
	}

	const CKEditorClassic = getCKCdnClassicEditor( { cloud } );

	return (
		<CKEditor
			editor={ CKEditorClassic }
			data={ content }
		/>
	);
}
