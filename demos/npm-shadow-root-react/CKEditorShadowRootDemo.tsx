/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import React, { useCallback, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { ClassicEditor, Bold, Essentials, Heading, Italic, Paragraph } from 'ckeditor5';

import { adoptCKEditorStyles } from './adoptCKEditorStyles.js';
import { CKEditor } from '../../src/index.js';

const SHADOW_ROOTS = new WeakMap<Element, ShadowRoot>();

type CKEditorShadowRootDemoProps = {
	content: string;
	mode: ShadowRootMode;
};

export const CKEditorShadowRootDemo = ( { content, mode }: CKEditorShadowRootDemoProps ): ReactNode => {
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
				<ShadowRootEditor content={ content } />,
				shadowRoot
			) }
		</>
	);
};

/**
 * Attaches a shadow root to the host and adopts the editor styles, or returns the one attached
 * earlier.
 *
 * A closed root is not readable through `host.shadowRoot` and `attachShadow` throws when called
 * twice, so the reference has to be kept here to survive the double mount in strict mode.
 *
 * @param host The element to attach the shadow root to.
 * @param mode The mode of the shadow root.
 */
function attachShadowRoot( host: HTMLDivElement, mode: ShadowRootMode ): ShadowRoot {
	let shadowRoot = SHADOW_ROOTS.get( host );

	if ( !shadowRoot ) {
		shadowRoot = host.attachShadow( { mode } );

		// Adopt before React renders into the root, so there is no unstyled frame. The document
		// needs the styles too, for the parts of the UI that the editor appends to `document.body`.
		adoptCKEditorStyles( shadowRoot );
		adoptCKEditorStyles( document );

		SHADOW_ROOTS.set( host, shadowRoot );
	}

	return shadowRoot;
}

/**
 * The editor itself. Nothing here knows about the shadow root — it is the stylesheets that had to be
 * dealt with, not the component.
 */
function ShadowRootEditor( { content }: { content: string } ): ReactNode {
	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ content }
			disableWatchdog
			config={ {
				licenseKey: 'GPL',
				plugins: [ Essentials, Paragraph, Heading, Bold, Italic ],
				toolbar: [ 'undo', 'redo', '|', 'heading', '|', 'bold', 'italic' ]
			} }
		/>
	);
}
